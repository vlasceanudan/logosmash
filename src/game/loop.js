import { renderGame } from "./render.js";
import { updateState } from "./physics.js";

export function startLoop({ state, ctx }) {
  function frame() {
    if (state.running) {
      updateState(state);
    }
    renderGame(ctx, state);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
