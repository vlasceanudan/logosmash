import { aimFromClientPoint, shoot } from "./physics.js";

export function bindInput({ root, canvas, state, onShoot }) {
  const handleKeyDown = (event) => {
    state.keys[event.code] = true;
    if (event.code === "Space" && state.running) {
      event.preventDefault();
      if (shoot(state) && onShoot) {
        onShoot();
      }
    }
  };

  const handleKeyUp = (event) => {
    state.keys[event.code] = false;
  };

  const handleMouseMove = (event) => {
    if (!state.running) return;
    aimFromClientPoint(state, canvas, event.clientX, event.clientY);
  };

  const handleMouseDown = (event) => {
    root.focus();
    if (event.button === 0 && shoot(state) && onShoot) {
      onShoot();
    }
  };

  const handleTouchMove = (event) => {
    if (!state.running || !event.touches || event.touches.length === 0) return;
    event.preventDefault();
    aimFromClientPoint(state, canvas, event.touches[0].clientX, event.touches[0].clientY);
  };

  const handleTouchStart = (event) => {
    root.focus();
    if (!state.running || !event.touches || event.touches.length === 0) return;
    aimFromClientPoint(state, canvas, event.touches[0].clientX, event.touches[0].clientY);
    if (shoot(state) && onShoot) {
      onShoot();
    }
  };

  root.addEventListener("keydown", handleKeyDown);
  root.addEventListener("keyup", handleKeyUp);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
  canvas.addEventListener("touchstart", handleTouchStart, { passive: false });

  return () => {
    root.removeEventListener("keydown", handleKeyDown);
    root.removeEventListener("keyup", handleKeyUp);
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("mousedown", handleMouseDown);
    canvas.removeEventListener("touchmove", handleTouchMove);
    canvas.removeEventListener("touchstart", handleTouchStart);
  };
}
