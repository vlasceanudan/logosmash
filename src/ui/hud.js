import { setBallSpeed } from "../game/physics.js";

export function createHudController({ speedInput, speedValue, state }) {
  function syncSpeedLabel() {
    speedValue.textContent = String(state.targetBallSpeed);
  }

  speedInput.min = String(state.config.speedMin);
  speedInput.max = String(state.config.speedMax);
  speedInput.step = String(state.config.speedStep);
  speedInput.value = String(state.config.defaultSpeed);

  speedInput.addEventListener("input", (event) => {
    setBallSpeed(state, event.target.value);
    syncSpeedLabel();
  });

  setBallSpeed(state, state.config.defaultSpeed);
  syncSpeedLabel();

  return {
    syncSpeedLabel
  };
}
