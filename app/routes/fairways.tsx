import { Link, useOutletContext } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import type { OutletContext, Profile } from "../utils/types";
import Ball from "../entities/ball";
import Hole from "../entities/hole";
import Obstacle from "../entities/obstacle";

const holes = [
  {
    holePos: [100, 100],
  },
  {
    holePos: [700, 100],
  },
  {
    holePos: [400, 100],
  }
];


export default function fairways() {
  const { session, supabase } = useOutletContext<OutletContext>();
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [partyMembers, setPartyMembers] = useState<Profile[]>([]);
  const [currHole, setCurrHole] = useState<number>(0);

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

    if (profile) {
      // TODO: wip
      console.log("Profile: ", profile);
      fetchPartyMembers();
    } else {
      fetchProfile();
    }

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

    // Create current hole
    const currentHole = holes[currHole];
    const hole = new Hole(currentHole.holePos[0], currentHole.holePos[1], 20);

    const updateGame = async (timestamp: number) => {
      const deltaTime = timestamp - lastTimestamp;

      if (deltaTime < timeStep) {
        requestAnimationFrame(updateGame);
        return;
      }

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = "lightgreen";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw hole
      hole.draw(ctx);

      // Update the last timestamp
      lastTimestamp = timestamp - (deltaTime % timeStep);

      // Request the next animation frame
      requestID = requestAnimationFrame(updateGame);
    }

    // Start the game loop
    requestID = requestAnimationFrame(updateGame);

    return () => {
      cancelAnimationFrame(requestID);
    }

  }, [profile]);

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
  )
}
