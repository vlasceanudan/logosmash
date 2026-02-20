import { GAME_CONFIG, deriveField } from "./config.js";

export function createInitialState(config = GAME_CONFIG) {
  const field = deriveField(config);
  return {
    config,
    field,
    ui: {
      phase: "idle",
      endReason: null,
      nickname: "",
      leaderboardStatus: "loading"
    },
    shooter: null,
    balls: [],
    bricks: [],
    score: 0,
    shotsLeft: config.maxShots,
    targetBallSpeed: config.defaultSpeed,
    keys: {},
    running: false,
    lastFinalScore: 0,
    onEnd: null
  };
}

export function resetGame(state) {
  const { config, field } = state;

  state.shooter = {
    x: config.canvas.width / 2,
    y: config.canvas.height - config.shooterBaseHeight - 12,
    theta: -Math.PI / 2
  };

  state.balls = [];
  state.bricks = [];
  for (let row = 0; row < field.rowCount; row += 1) {
    for (let col = 0; col < field.colCount; col += 1) {
      if (config.pattern[row][col] === "1") {
        state.bricks.push({
          x: field.brickOffsetX + col * (field.brickWidth + config.brickPadding),
          y: config.brickOffsetY + row * (config.brickHeight + config.brickPadding),
          w: field.brickWidth,
          h: config.brickHeight,
          alive: true
        });
      }
    }
  }

  state.score = 0;
  state.shotsLeft = config.maxShots;
  state.keys = {};
  state.ui.endReason = null;
}
