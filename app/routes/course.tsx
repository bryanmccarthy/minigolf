import { useEffect, useRef } from "react";
import Ball from "../entities/ball";
import Hole from "../entities/hole";

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
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    const WIDTH = 1000;
    const HEIGHT = 800;
    
    if (!ctx) return;
    ctx.canvas.width = WIDTH;
    ctx.canvas.height = HEIGHT;

    let requestID: number;

    // FPS
    let lastTimestamp = 0;
    const targetFps = 30;
    const timeStep = 1000 / targetFps;

    // Mouse
    let isMouseDown = false;
    let mouseDownX = 0;
    let mouseDownY = 0;

    // Initial game objects
    const ball = new Ball(WIDTH / 2, HEIGHT / 2, 0, 0, 10, "white");
    const hole1 = new Hole(250, 150, 20);
    const hole2 = new Hole(700, 700, 20);
    const hole3 = new Hole(150, 700, 20);
    const hole4 = new Hole(850, 350, 20);

    const handleMouseDown = (e: MouseEvent) => {
      if (ball.moving) return;

      isMouseDown = true;
      const rect = canvas.getBoundingClientRect();
      mouseDownX = e.clientX - rect.left;
      mouseDownY = e.clientY - rect.top;
    }

    const handleMouseUp = (e: MouseEvent) => {
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

    const updateGame = (timestamp: number) => {
      const deltaTime = timestamp - lastTimestamp;

      if (deltaTime < timeStep) {
        requestAnimationFrame(updateGame);
        return;
      }

      // TODO: Move collision to ball // Obstacle
      if (ball.x <= 0 || ball.x >= WIDTH) {
        ball.vx *= -1;
      }
      if (ball.y <= 0 || ball.y >= HEIGHT) {
        ball.vy *= -1;
      }

      if (ball.x >= hole1.x - hole1.radius && ball.x <= hole1.x + hole1.radius && ball.y >= hole1.y - hole1.radius && ball.y <= hole1.y + hole1.radius) {
        ball.x = hole1.x;
        ball.y = hole1.y;
        ball.vx = 0;
        ball.vy = 0;
      }

      if (ball.x >= hole2.x - hole2.radius && ball.x <= hole2.x + hole2.radius && ball.y >= hole2.y - hole2.radius && ball.y <= hole2.y + hole2.radius) {
        ball.x = hole2.x;
        ball.y = hole2.y;
        ball.vx = 0;
        ball.vy = 0;
      }

      if (ball.x >= hole3.x - hole3.radius && ball.x <= hole3.x + hole3.radius && ball.y >= hole3.y - hole3.radius && ball.y <= hole3.y + hole3.radius) {
        ball.x = hole3.x;
        ball.y = hole3.y;
        ball.vx = 0;
        ball.vy = 0;
      }

      if (ball.x >= hole4.x - hole4.radius && ball.x <= hole4.x + hole4.radius && ball.y >= hole4.y - hole4.radius && ball.y <= hole4.y + hole4.radius) {
        ball.x = hole4.x;
        ball.y = hole4.y;
        ball.vx = 0;
        ball.vy = 0;
      }

      // Update ball
      ball.update();

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = "lightgreen";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Hole
      hole1.draw(ctx);
      hole2.draw(ctx);
      hole3.draw(ctx);
      hole4.draw(ctx);

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

  }, []);

  return (
    <div className="flex justify-center items-center w-full h-[calc(100dvh)]">
      <canvas ref={canvasRef} />
    </div>
  )
}