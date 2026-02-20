import { shooterMuzzle } from "./physics.js";

export function renderGame(ctx, state) {
  const { config } = state;
  const width = config.canvas.width;
  const height = config.canvas.height;

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(0, 0, config.fieldMargin, height);
  ctx.fillRect(width - config.fieldMargin, 0, config.fieldMargin, height);

  ctx.strokeStyle = "rgba(255,237,0,0.6)";
  ctx.lineWidth = config.wallLineWidth;
  ctx.beginPath();
  ctx.moveTo(config.fieldMargin, 0);
  ctx.lineTo(config.fieldMargin, height);
  ctx.moveTo(width - config.fieldMargin, 0);
  ctx.lineTo(width - config.fieldMargin, height);
  ctx.stroke();

  drawTrajectory(ctx, state);

  ctx.fillStyle = "#ffed00";
  ctx.fillRect(
    state.shooter.x - config.shooterBaseWidth / 2,
    state.shooter.y,
    config.shooterBaseWidth,
    config.shooterBaseHeight
  );

  const muzzle = shooterMuzzle(state);
  ctx.strokeStyle = "rgba(255,237,0,0.95)";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(state.shooter.x, state.shooter.y);
  ctx.lineTo(muzzle.x, muzzle.y);
  ctx.stroke();

  ctx.fillStyle = "#ffed00";
  for (const ball of state.balls) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const brick of state.bricks) {
    if (brick.alive) {
      ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
    }
  }

  ctx.fillStyle = "#ffed00";
  ctx.font = "18px sans-serif";
  ctx.fillText(`Score: ${state.score}`, 10, 24);
  ctx.fillText(`Shots: ${state.shotsLeft}`, width - 115, 24);
}

function drawTrajectory(ctx, state) {
  const { config } = state;
  const muzzle = shooterMuzzle(state);

  let x = muzzle.x;
  let y = muzzle.y;
  let dx = Math.cos(muzzle.theta) * state.targetBallSpeed;
  let dy = Math.sin(muzzle.theta) * state.targetBallSpeed;

  if (dy > -0.5) {
    return;
  }

  ctx.fillStyle = "rgba(255,237,0,0.35)";

  const steps = 180;
  const dotEvery = 6;
  for (let i = 0; i < steps; i += 1) {
    x += dx;
    y += dy;

    if (x < config.fieldMargin + config.ballRadius) {
      x = config.fieldMargin + config.ballRadius;
      dx *= -1;
    }
    if (x > config.canvas.width - config.fieldMargin - config.ballRadius) {
      x = config.canvas.width - config.fieldMargin - config.ballRadius;
      dx *= -1;
    }
    if (y < config.ballRadius) {
      y = config.ballRadius;
      dy *= -1;
    }

    if (i % dotEvery === 0) {
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (y > config.canvas.height - 2) {
      break;
    }
  }
}
