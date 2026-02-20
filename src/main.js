import { GAME_CONFIG } from "./game/config.js";
import { createInitialState, resetGame } from "./game/state.js";
import { bindInput } from "./game/input.js";
import { startLoop } from "./game/loop.js";
import { createHudController } from "./ui/hud.js";
import { createOverlayController } from "./ui/overlay.js";
import { createLeaderboardView } from "./ui/leaderboardView.js";
import { createLeaderboardClient } from "./services/leaderboardClient.js";
import { getSavedNickname } from "./services/storage.js";

const root = document.getElementById("ls-app");
const canvas = document.getElementById("ls-canvas");
const ctx = canvas.getContext("2d");

const speedInput = document.getElementById("ls-speed");
const speedValue = document.getElementById("ls-speedVal");

const overlayEl = document.getElementById("ls-overlay");
const overlayTitle = document.getElementById("ls-overlayTitle");
const overlayText = document.getElementById("ls-overlayText");
const overlayExtra = document.getElementById("ls-overlayExtra");
const startBtn = document.getElementById("ls-startBtn");

const lbStatus = document.getElementById("ls-lbStatus");
const lbBody = document.getElementById("ls-lbBody");
const lbRefresh = document.getElementById("ls-lbRefresh");

canvas.width = GAME_CONFIG.canvas.width;
canvas.height = GAME_CONFIG.canvas.height;

const state = createInitialState(GAME_CONFIG);
state.ui.nickname = getSavedNickname();

const leaderboardClient = createLeaderboardClient(window.LOGO_SMASH_ENV || {});
const leaderboardView = createLeaderboardView({
  statusEl: lbStatus,
  bodyEl: lbBody,
  refreshBtn: lbRefresh,
  client: leaderboardClient
});

createHudController({
  speedInput,
  speedValue,
  state
});

const overlay = createOverlayController({
  overlayEl,
  titleEl: overlayTitle,
  textEl: overlayText,
  extraEl: overlayExtra,
  startBtn,
  submitScore: (entry) => leaderboardClient.submitScore(entry),
  onSaved: async () => {
    await leaderboardView.refresh(10);
  },
  onNicknameSaved: (nickname) => {
    state.ui.nickname = nickname;
  }
});

state.onEnd = ({ reason, score }) => {
  overlay.showEnd({
    reason,
    score,
    defaultNickname: state.ui.nickname
  });
};

startBtn.addEventListener("click", () => {
  resetGame(state);
  state.running = true;
  state.ui.phase = "running";
  overlay.hide();
  root.focus();
});

root.tabIndex = 0;
bindInput({
  root,
  canvas,
  state,
  onShoot: () => {
    // no side-effect needed right now; reserved for future audio hooks
  }
});

resetGame(state);
overlay.showStart();
leaderboardView.refresh(10).catch(() => {});
startLoop({ state, ctx });
