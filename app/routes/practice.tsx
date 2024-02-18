import { useEffect, useRef } from "react";
import Ball from "../entities/ball";
import Hole from "../entities/hole";
import { useState } from "react";
import { Link, useOutletContext } from "@remix-run/react";
import type { OutletContext, Profile } from "../utils/types";
import { RealtimePostgresUpdatePayload } from "@supabase/supabase-js";

class Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height:number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "black";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

export default function game() {
  const { session, supabase } = useOutletContext<OutletContext>();
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [partyMembers, setPartyMembers] = useState<Profile[]>([]);

  const updatePlayerPosition = async (x: number, y: number) => {
    const { error } = await supabase.from("profiles").update({ ball_x: x, ball_y: y }).eq("id", profile?.id);
    if (error) {
      console.log("Error updating player position: ", error.message);
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from("profiles").select().eq("id", session.user.id);

      if (data) {
        setProfile(data[0]);
      }
    }

    const fetchPartyMembers = async () => {
      if (!profile) return;

      const { data, error } = await supabase.from("profiles").select().eq("party_id", profile.party_id);
      if (data) {
        const filteredData = data.filter((member: Profile) => member.id !== profile.id);
        setPartyMembers(filteredData);
        console.log("Party members: ", filteredData);
      } else {
        console.log("error: ", error); // TODO: handle error
      }
    }

    if (profile) {
      // TODO: wip
      console.log("Profile: ", profile);
      fetchPartyMembers();
    } else {
      fetchProfile();
    }

    // Profile channel contains ball updates
    const profileChannel = supabase.channel('profiles');

    if (profile?.party_id !== null) {
      profileChannel
        .on(
          'postgres_changes',
          { event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `party_id=eq.${profile?.party_id}`
          },
          (
            payload: RealtimePostgresUpdatePayload<Profile>
          ) => {
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
    }

  }, [profile]);

  // TODO: useEffect for moving obstacle

  useEffect(() => {
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
    let isMouseDown = false;
    let mouseDownX = 0;
    let mouseDownY = 0;

    // Initial game objects
    const ball = new Ball(WIDTH / 2, HEIGHT / 2, 0, 0, 10, "white");
    const holes = [
      new Hole(100, 100, 20),
      new Hole(250, 500, 20),
      new Hole(700, 300, 20),
    ];

    const handleMouseDown = (e: MouseEvent) => {
      if (ball.moving) return;

      isMouseDown = true;
      const rect = canvas.getBoundingClientRect();
      mouseDownX = e.clientX - rect.left;
      mouseDownY = e.clientY - rect.top;
    }

    const handleMouseUp = async (e: MouseEvent) => {
      if (ball.moving) return;

      isMouseDown = false;
      const rect = canvas.getBoundingClientRect();
      const mouseUpX = e.clientX - rect.left;
      const mouseUpY = e.clientY - rect.top;
      ball.hit(mouseUpX, mouseUpY);
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (ball.moving) return;

      if (isMouseDown) {
        const rect = canvas.getBoundingClientRect();
        mouseDownX = e.clientX - rect.left;
        mouseDownY = e.clientY - rect.top;
      }
    }

    const drawOutOfBoundsMessage = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.fillText("Out of bounds!", width / 2 - 100, height / 2);
    }

    const handleOutOfBounds = () => {
      ball.x = WIDTH / 2;
      ball.y = HEIGHT / 2;
      ball.vx = 0;
      ball.vy = 0;
      ball.moving = false;
      drawOutOfBoundsMessage(ctx, WIDTH, HEIGHT);
    }

    const drawHoleMessage = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.fillText("Hole!", width / 2 - 50, height / 2);
    }

    const updateGame = async (timestamp: number) => {
      const deltaTime = timestamp - lastTimestamp;

      if (deltaTime < timeStep) {
        requestAnimationFrame(updateGame);
        return;
      }

      if (ball.inHole) {
        drawHoleMessage(ctx, WIDTH, HEIGHT);
        await new Promise(r => setTimeout(r, 1000));
        ball.inHole = false;
        ball.x = WIDTH / 2;
        ball.y = HEIGHT / 2;
      }

      // Collisions
      if (ball.x <= 0 || ball.x >= WIDTH) {
        handleOutOfBounds();
        await new Promise(r => setTimeout(r, 1000));
      }
      if (ball.y <= 0 || ball.y >= HEIGHT) {
        handleOutOfBounds();
        await new Promise(r => setTimeout(r, 1000));
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
          ball.moving = false;
          ball.inHole = true;
        }
      }

      // Update ball
      ball.update();

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = "lightgreen";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Hole
      for (let i = 0; i < holes.length; i++) {
        holes[i].draw(ctx);
      }

      // Ball
      ball.draw(ctx);
      if (isMouseDown) ball.drawPower(ctx, mouseDownX, mouseDownY);

      // Update the last timestamp
      lastTimestamp = timestamp - (deltaTime % timeStep);

      // Request the next animation frame
      requestID = requestAnimationFrame(updateGame);
    };

    // Start the game loop
    requestID = requestAnimationFrame(updateGame);

    // Add event listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);

      cancelAnimationFrame(requestID);
    }

  }, [profile]);

  // TODO: wait for all members to join (maybe ready up) -- not so important for practice mode
  // return a loading screen if not all members have joined

  return (
    <div className="flex flex-col w-full h-[calc(100dvh)] bg-blue-400 overflow-hidden">
      <div className="flex py-4">
        <Link to={"/lobby"} className="flex items-center text-lg px-2 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          <p>Back to lobby</p>
        </Link>
      </div>
      <div className="flex justify-center items-center">
        <canvas ref={canvasRef} width={800} height={600} className="rounded-lg" />
      </div>
    </div>
  )
}
