enum StrokeState {
  STILL = "still",
  MOVING = "moving",
  FINISHED = "finished",
  IN_HOLE = "inHole",
  OUT_OF_BOUNDS = "outOfBounds"
}

export default class Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  strokeState: string = StrokeState.STILL;
  inHole: boolean = false;
  friction: number = 0.96;

  constructor(id: string, x: number, y: number, vx: number, vy: number, radius: number, color: string) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
  }

  hit(mouseUpX: number, mouseUpY: number) {
    // Calculate the distance between the mouse and the ball
    const dx = mouseUpX - this.x;
    const dy = mouseUpY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    let power = 0;

    if (distance > 20 && distance < 40) power = 5;
    else if (distance < 60) power = 10;
    else if (distance < 80) power = 15;
    else if (distance < 100) power = 20;
    else power = 25;

    // Calculate the velocity away from the mouse
    this.vx = -dx / distance * power;
    this.vy = -dy / distance * power;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  }

  drawPower(ctx: CanvasRenderingContext2D, mouseDownX: number, mouseDownY: number) {
    // Calculate the distance between the mouse and the ball
    const dx = mouseDownX - this.x;
    const dy = mouseDownY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    let power = 0;
    let arrowStyle = "green";

    if (distance > 20 && distance < 40) {
      power = 1;
      arrowStyle = "lightorange";
    } else if (distance < 60) {
      power = 2;
      arrowStyle = "orange";
    } else if (distance < 80) {
      power = 3;
      arrowStyle = "darkorange";
    } else if (distance < 100) {
      power = 4;
      arrowStyle = "orangered";
    } else {
      power = 5;
      arrowStyle = "red";
    }

    ctx.save(); 

    // Draw arrow line
    ctx.lineWidth = 4;
    ctx.strokeStyle = arrowStyle;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    if (distance < 110) ctx.lineTo(this.x - dx, this.y - dy)
    else ctx.lineTo(this.x - dx / distance * 110, this.y - dy / distance * 110);
    ctx.stroke();
    ctx.closePath();

    // Draw arrow head
    ctx.fillStyle = arrowStyle;
    if (distance < 120) ctx.translate(this.x - dx, this.y - dy);
    else ctx.translate(this.x - dx / distance * 120, this.y - dy / distance * 120);
    ctx.rotate(Math.atan2(dy, dx));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(20, 10);
    ctx.lineTo(20, -10);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    this.vx *= this.friction;
    this.vy *= this.friction;
    if (Math.abs(this.vx) < 0.1) this.vx = 0;
    if (Math.abs(this.vy) < 0.1) this.vy = 0;
    if (this.vx === 0 && this.vy === 0) {
      if (this.strokeState === StrokeState.MOVING) this.strokeState = "finished";
    } else {
      this.strokeState = StrokeState.MOVING;
    }
  }
}
