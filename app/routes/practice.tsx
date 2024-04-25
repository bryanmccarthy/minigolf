import { useState, useEffect, useRef } from "react";
import Ball from "../entities/ball";
import Hole from "../entities/hole";
import Obstacle from "../entities/obstacle";
import { Link, useOutletContext } from "@remix-run/react";
import type { OutletContext, Profile } from "../utils/types";
import { RealtimePostgresUpdatePayload } from "@supabase/supabase-js";

export default function game() {
  const { session, supabase } = useOutletContext<OutletContext>();
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [partyMembers, setPartyMembers] = useState<Profile[]>([]);
  const [partyMembersBalls, setPartyMembersBalls] = useState<any[]>([]);
  const [ballPos, setBallPos] = useState<any | null>(null);

  const updatePlayerPosition = async (x: number, y: number) => {
    console.log("Updating player: ", profile?.id, x, y);

    const { error } = await supabase
      .from("balls")
      .update({ x, y })
      .eq("profile_id", profile?.id);
    if (error) {
      console.log("Error updating player position: ", error.message);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select()
        .eq("id", session.user.id);

      if (data) {
        setProfile(data[0]);
      }
    };

    const fetchPartyMembers = async () => {
      if (!profile) return;

      const { data, error } = await supabase
        .from("profiles")
        .select()
        .eq("party_id", profile.party_id);
      if (data) {
        const filteredData = data.filter(
          (member: Profile) => member.id !== profile.id
        );
        setPartyMembers(filteredData);
        console.log("Party members: ", filteredData);
      } else {
        console.log("error: ", error); // TODO: handle error
      }
    };

    const fetchPartyMembersBalls = async () => {
      if (!profile) return;

      const { data, error } = await supabase
        .from("balls")
        .select()
        .eq("party_id", profile.party_id);
      if (data) {
        console.log("Party members balls: ", data);
        setPartyMembersBalls(data);
      } else {
        console.log("error: ", error); // TODO: handle error
      }
    };

    const fetchBall = async () => {
      if (!profile) return;

      const { data, error } = await supabase
        .from("balls")
        .select()
        .eq("profile_id", profile.id);
      if (data) {
        console.log("Ball: ", data[0]);
        setBallPos(data[0]);
      } else {
        console.log("error: ", error); // TODO: handle error
      }
    };

    if (profile) {
      // TODO: wip
      console.log("Profile: ", profile);
      fetchPartyMembers();
      fetchPartyMembersBalls();
      fetchBall();
    } else {
      fetchProfile();
    }

    const profileChannel = supabase.channel("profiles");

    if (profile?.party_id !== null) {
      profileChannel
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `party_id=eq.${profile?.party_id}`,
          },
          (payload: RealtimePostgresUpdatePayload<Profile>) => {
            const updatedProfileId = payload.new.id;

            if (updatedProfileId === profile?.id) {
              setProfile(payload.new);
            } else {
              const newPartyMembers = [...partyMembers];

              newPartyMembers.filter((member) => {
                member.id === updatedProfileId;
              });

              newPartyMembers.push(payload.new);
              setPartyMembers(newPartyMembers);
            }
          }
        )
        .subscribe();
    }

    return () => {
      profileChannel && supabase.removeChannel(profileChannel);
    };
  }, [profile]);

  useEffect(() => {
    if (!profile) return;

    const canvas = canvasRef.current;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    const WIDTH = 800;
    const HEIGHT = 600;

    if (!ctx) return;

    let requestID: number;

    // FPS
    let lastTimestamp = 0;
    const targetFps = 60;
    const timeStep = 1000 / targetFps;

    // Mouse
    let mouseX = 0;
    let mouseY = 0;
    let isMouseDown = false;
    let mouseDownX = 0;
    let mouseDownY = 0;

    // Initial game objects
    const initialX = ballPos?.x || WIDTH / 2;
    const initialY = ballPos?.y || HEIGHT / 2;
    const ball = new Ball(
      profile.id,
      `${profile.display_name} (ME)`,
      initialX,
      initialY,
      0,
      0,
      10,
      "white"
    );
    const holes = [
      new Hole(100, 100, 20),
      new Hole(250, 500, 20),
      new Hole(700, 300, 20),
    ];
    const obstacles = [
      new Obstacle(150, 150, 10, 80, "darkred"),
      new Obstacle(150, 150, 80, 10, "darkred"),
      new Obstacle(230, 80, 10, 80, "darkred"),
      new Obstacle(230, 450, 80, 10, "darkred"),
      new Obstacle(310, 450, 10, 80, "darkred"),
      new Obstacle(600, 250, 10, 100, "darkred"),
    ];
    const numObstacles = obstacles.length;

    // Party Members
    const membersBalls: any[] = partyMembersBalls
      .filter((ball: any) => ball.profile_id !== profile.id)
      .map((ball: any) => {
        const playerProfile: any = partyMembers.find(
          (member: Profile) => member.id === ball.profile_id
        );
        const playerName = playerProfile?.display_name || "Unknown";
        return new Ball(
          ball.profile_id,
          playerName,
          ball.x,
          ball.y,
          0,
          0,
          10,
          "orange"
        );
      });
    console.log("Members balls: ", membersBalls);

    const handleMouseDown = (e: MouseEvent) => {
      if (ball.strokeState === "moving") return;

      isMouseDown = true;
      const rect = canvas.getBoundingClientRect();
      mouseDownX = e.clientX - rect.left;
      mouseDownY = e.clientY - rect.top;
    };

    const handleMouseUp = async (e: MouseEvent) => {
      if (ball.strokeState === "moving") return;
      if (ball.strokeState === "inHole") {
        ball.strokeState = "still";
        ball.x = WIDTH / 2;
        ball.y = HEIGHT / 2;
        ball.vx = 0;
        ball.vy = 0;
        isMouseDown = false;
        updatePlayerPosition(ball.x, ball.y);
        return;
      }

      isMouseDown = false;
      const rect = canvas.getBoundingClientRect();
      const mouseUpX = e.clientX - rect.left;
      const mouseUpY = e.clientY - rect.top;
      ball.hit(mouseUpX, mouseUpY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (ball.strokeState === "moving") return;

      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      if (isMouseDown) {
        const rect = canvas.getBoundingClientRect();
        mouseDownX = e.clientX - rect.left;
        mouseDownY = e.clientY - rect.top;
      }
    };

    const drawOutOfBoundsMessage = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number
    ) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.fillText("Out of bounds!", width / 2 - 100, height / 2);
    };

    const handleOutOfBounds = () => {
      ball.x = WIDTH / 2;
      ball.y = HEIGHT / 2;
      ball.vx = 0;
      ball.vy = 0;
      ball.strokeState = "still";
      drawOutOfBoundsMessage(ctx, WIDTH, HEIGHT);
      updatePlayerPosition(ball.x, ball.y);
    };

    const drawHoleMessage = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number
    ) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.fillText(
        "Hole! Click anywhere to continue.",
        width / 2 - 225,
        height / 2
      );
    };

    const displayMemberBallInfo = async (memberBall: Ball) => {
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fillText(
        `• ${memberBall.display_name}`,
        memberBall.x - 5,
        memberBall.y - 20
      );
    };

    const updateGame = async (timestamp: number) => {
      const deltaTime = timestamp - lastTimestamp;

      if (deltaTime < timeStep) {
        requestAnimationFrame(updateGame);
        return;
      }

      // Obstacle Collisions
      for (let i=0; i < numObstacles; i++) {
        if (obstacles[i].collides(ball.x, ball.y, ball.radius)) {
          const side = obstacles[i].collisionSide(ball.x, ball.y, ball.radius);

          if (side === "top" || side === "bottom") {
            ball.vy *= -1;
          } else if (side === "left" || side === "right") {
            ball.vx *= -1;
          }
        }
      }

      // OOB Collisions
      if (ball.x <= 0 || ball.x >= WIDTH) {
        handleOutOfBounds();
        await new Promise((r) => setTimeout(r, 1000));
      }
      if (ball.y <= 0 || ball.y >= HEIGHT) {
        handleOutOfBounds();
        await new Promise((r) => setTimeout(r, 1000));
      }

      // Hole Collisions
      for (let i = 0; i < holes.length; i++) {
        const hole = holes[i];
        const dx = ball.x - hole.x;
        const dy = ball.y - hole.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < hole.radius) {
          ball.x = hole.x;
          ball.y = hole.y;
          ball.vx = 0;
          ball.vy = 0;
          if (ball.strokeState === "moving") {
            ball.strokeState = "finished";
          } else {
            ball.strokeState = "inHole";
          }
        }
      }

      // Update ball
      ball.update();

      // Update player position
      if (ball.strokeState === "finished") {
        updatePlayerPosition(ball.x, ball.y);
        ball.strokeState = "still";
      }

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = "lightgreen";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Obstacles
      for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].draw(ctx);
      }

      // Holes
      for (let i = 0; i < holes.length; i++) {
        holes[i].draw(ctx);
      }

      // Ball
      ball.draw(ctx);
      if (isMouseDown) ball.drawPower(ctx, mouseDownX, mouseDownY);

      // Members Balls
      for (let i = 0; i < membersBalls.length; i++) {
        membersBalls[i].draw(ctx);
      }

      if (ball.strokeState === "inHole") {
        drawHoleMessage(ctx, WIDTH, HEIGHT);
      }

      // Check for mouse hover over ball
      const dx = ball.x - mouseX;
      const dy = ball.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < ball.radius) {
        displayMemberBallInfo(ball);
      }

      // Check for mouse hover over members balls
      for (let i = 0; i < membersBalls.length; i++) {
        const memberBall = membersBalls[i];
        const dx = memberBall.x - mouseX;
        const dy = memberBall.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < memberBall.radius) {
          displayMemberBallInfo(memberBall);
        }
      }

      // Debug -- Ball state
      // ctx.fillStyle = "black";
      // ctx.font = "20px Arial";
      // ctx.fillText(`Ball state: ${ball.strokeState}`, 10, 30);

      // Update the last timestamp
      lastTimestamp = timestamp - (deltaTime % timeStep);

      // Request the next animation frame
      requestID = requestAnimationFrame(updateGame);
    }

    // Start the game loop
    requestID = requestAnimationFrame(updateGame);

    // Add event listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);

    const ballChannel = supabase.channel("balls");

    if (profile?.party_id !== null) {
      ballChannel
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "balls",
          },
          (payload: RealtimePostgresUpdatePayload<any>) => {
            console.log("Ball update: ", payload.new);
            membersBalls.forEach((memberBall) => {
              if (memberBall.id === payload.new.profile_id) {
                memberBall.x = payload.new.x;
                memberBall.y = payload.new.y;
              }
            });
          }
        )
        .subscribe();
    }

    return () => {
      ballChannel && supabase.removeChannel(ballChannel);

      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);

      cancelAnimationFrame(requestID);
    };
  }, [profile, ballPos]);

  return (
    <div className="flex flex-col w-full h-[calc(100dvh)] bg-blue-400 overflow-hidden">
      <div className="flex py-4">
        <Link
          to={"/lobby"}
          className="flex items-center text-lg px-2 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
          <p>Back to lobby</p>
        </Link>
        <div className="flex ml-auto gap-2 mr-4">
          <div className="flex items-center gap-1 bg-neutral-100 rounded p-1">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <p>{profile?.display_name} (ME)</p>
          </div>
          {partyMembers.map((member: Profile, idx: number) => (
            <div
              key={idx}
              className="flex items-center gap-1 bg-neutral-100 rounded p-1"
            >
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <p>{member.display_name}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center items-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="rounded-lg"
        />
      </div>
    </div>
  );
}
