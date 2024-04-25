export default class Hole {
  x: number;
  y: number;
  radius: number;

  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Draw the hole center
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();

    // Draw the hole border
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw flag pole
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.y - this.radius - 10);
    ctx.stroke();

    // Draw flag
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.radius - 10);
    ctx.lineTo(this.x + 20, this.y - this.radius - 10 - 10);
    ctx.lineTo(this.x, this.y - this.radius - 10 - 20);
    ctx.fill();
  }
}
