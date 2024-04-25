export default class Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  // active: boolean;

  constructor(x: number, y: number, width: number, height: number, color: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  collides(x: number, y: number, radius: number) {
    return (
      x - radius < this.x + this.width &&
      x + radius > this.x &&
      y - radius < this.y + this.height &&
      y + radius > this.y
    );
  }

  collisionSide(x: number, y: number, radius: number) {
    const top = this.y;
    const bottom = this.y + this.height;
    const left = this.x;
    const right = this.x + this.width;

    if (y - radius <= top) return "top";
    if (y + radius >= bottom) return "bottom";
    if (x - radius <= left) return "left";
    if (x + radius >= right) return "right";
  }
}
