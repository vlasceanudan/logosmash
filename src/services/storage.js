const NICKNAME_KEY = "logo_smash_nickname";

export function getSavedNickname() {
  try {
    return (localStorage.getItem(NICKNAME_KEY) || "").trim();
  } catch {
    return "";
  }
}

export function saveNickname(nickname) {
  try {
    localStorage.setItem(NICKNAME_KEY, nickname);
  } catch {
    // no-op
  }
}
