export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

export function setBallSpeed(state, newSpeed) {
  const { speedMin, speedMax } = state.config;
  state.targetBallSpeed = clamp(Number(newSpeed), speedMin, speedMax);
}

export function aimFromClientPoint(state, canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const mx = clientX - rect.left;
  const my = clientY - rect.top;

  const dx = mx - state.shooter.x;
  const dy = my - state.shooter.y;

  let theta = Math.atan2(dy, dx);
  const minTheta = -Math.PI + degToRad(state.config.minAimDeg);
  const maxTheta = -degToRad(state.config.minAimDeg);
  theta = clamp(theta, minTheta, maxTheta);

  state.shooter.theta = theta;
}

export function shooterMuzzle(state) {
  const { barrelLength } = state.config;
  return {
    x: state.shooter.x + Math.cos(state.shooter.theta) * barrelLength,
    y: state.shooter.y + Math.sin(state.shooter.theta) * barrelLength,
    theta: state.shooter.theta
  };
}

export function shoot(state) {
  if (!state.running || state.shotsLeft <= 0) {
    return false;
  }

  state.shotsLeft -= 1;
  const muzzle = shooterMuzzle(state);
  const speed = state.targetBallSpeed;

  state.balls.push({
    x: muzzle.x,
    y: muzzle.y,
    dx: Math.cos(muzzle.theta) * speed,
    dy: Math.sin(muzzle.theta) * speed,
    r: state.config.ballRadius,
    alive: true
  });

  return true;
}

export function updateState(state) {
  const { config } = state;

  if (state.keys.ArrowLeft) {
    state.shooter.x -= config.shooterSpeed;
  }
  if (state.keys.ArrowRight) {
    state.shooter.x += config.shooterSpeed;
  }

  state.shooter.x = clamp(
    state.shooter.x,
    config.fieldMargin + config.shooterBaseWidth / 2,
    config.canvas.width - config.fieldMargin - config.shooterBaseWidth / 2
  );

  for (const ball of state.balls) {
    if (!ball.alive) continue;

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x < config.fieldMargin + ball.r) {
      ball.x = config.fieldMargin + ball.r;
      ball.dx *= -1;
    }
    if (ball.x > config.canvas.width - config.fieldMargin - ball.r) {
      ball.x = config.canvas.width - config.fieldMargin - ball.r;
      ball.dx *= -1;
    }
    if (ball.y < ball.r) {
      ball.y = ball.r;
      ball.dy *= -1;
    }

    for (const brick of state.bricks) {
      if (!brick.alive) continue;

      if (
        ball.x + ball.r > brick.x &&
        ball.x - ball.r < brick.x + brick.w &&
        ball.y + ball.r > brick.y &&
        ball.y - ball.r < brick.y + brick.h
      ) {
        brick.alive = false;
        state.score += 1;

        const prevX = ball.x - ball.dx;
        const prevY = ball.y - ball.dy;
        const wasLeft = prevX + ball.r <= brick.x;
        const wasRight = prevX - ball.r >= brick.x + brick.w;
        const wasAbove = prevY + ball.r <= brick.y;
        const wasBelow = prevY - ball.r >= brick.y + brick.h;

        if (wasLeft || wasRight) {
          ball.dx *= -1;
        } else if (wasAbove || wasBelow) {
          ball.dy *= -1;
        } else {
          ball.dy *= -1;
        }

        break;
      }
    }

    if (ball.y - ball.r > config.canvas.height) {
      ball.alive = false;
    }
  }

  if (state.balls.some((ball) => !ball.alive)) {
    state.balls = state.balls.filter((ball) => ball.alive);
  }

  const allDestroyed = state.bricks.every((brick) => !brick.alive);
  if (allDestroyed) {
    endGame(state, "win");
    return;
  }

  const hasAliveBricks = state.bricks.some((brick) => brick.alive);
  if (state.shotsLeft <= 0 && state.balls.length === 0 && hasAliveBricks) {
    endGame(state, "out_of_ammo");
  }
}

function endGame(state, reason) {
  state.running = false;
  state.ui.phase = "ended";
  state.ui.endReason = reason;
  state.lastFinalScore = state.score;

  if (typeof state.onEnd === "function") {
    state.onEnd({ reason, score: state.score });
  }
}
