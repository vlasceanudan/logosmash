import { saveNickname } from "../services/storage.js";

export function createOverlayController({
  overlayEl,
  titleEl,
  textEl,
  extraEl,
  startBtn,
  submitScore,
  onSaved,
  onNicknameSaved
}) {
  function showStart() {
    titleEl.textContent = "Ready to play?";
    textEl.textContent = "Press Start and clear the full logo.";
    extraEl.innerHTML = "";
    startBtn.hidden = false;
    startBtn.textContent = "Start";
    overlayEl.classList.remove("hidden");
  }

  function hide() {
    overlayEl.classList.add("hidden");
  }

  function showEnd({ reason, score, defaultNickname }) {
    titleEl.textContent = reason === "win" ? "You Win" : "Out of ammo";
    textEl.textContent = `Score: ${score}`;

    startBtn.hidden = false;
    startBtn.textContent = "Play again";

    extraEl.innerHTML = `
      <form id="ls-saveForm" class="ls-form" novalidate>
        <input
          id="ls-nickname"
          class="ls-input"
          type="text"
          minlength="2"
          maxlength="20"
          placeholder="Nickname"
          value="${escapeHtml(defaultNickname || "")}"
          aria-label="Nickname"
          required
        >
        <button id="ls-saveBtn" class="ls-btn" type="submit">Save score</button>
      </form>
      <p id="ls-saveStatus" class="ls-inlineStatus"></p>
    `;

    const form = document.getElementById("ls-saveForm");
    const nicknameInput = document.getElementById("ls-nickname");
    const saveBtn = document.getElementById("ls-saveBtn");
    const saveStatus = document.getElementById("ls-saveStatus");

    if (nicknameInput) {
      nicknameInput.focus();
    }

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nickname = String(nicknameInput?.value || "").trim();
      if (nickname.length < 2 || nickname.length > 20) {
        saveStatus.textContent = "Nickname must be 2-20 characters.";
        return;
      }

      saveBtn.disabled = true;
      saveStatus.textContent = "Saving...";

      try {
        const result = await submitScore({ nickname, score });
        saveStatus.textContent = result.reason;
        saveNickname(nickname);

        if (typeof onNicknameSaved === "function") {
          onNicknameSaved(nickname);
        }

        if (result.saved && typeof onSaved === "function") {
          await onSaved();
        }
      } catch (error) {
        saveStatus.textContent = `Save failed: ${error.message}`;
      } finally {
        saveBtn.disabled = false;
      }
    });

    overlayEl.classList.remove("hidden");
  }

  return {
    showStart,
    showEnd,
    hide
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
