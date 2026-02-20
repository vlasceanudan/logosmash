function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function createLeaderboardView({ statusEl, bodyEl, refreshBtn, client }) {
  async function refresh(limit = 10) {
    statusEl.textContent = "Loading...";
    bodyEl.innerHTML = "";

    try {
      const rows = await client.getTopScores(limit);
      if (rows.length === 0) {
        statusEl.textContent = "No scores yet. Be the first!";
        return;
      }

      statusEl.textContent = "";
      rows.forEach((row, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="ls-lbDim">${index + 1}</td>
          <td>${escapeHtml(row.nickname)}</td>
          <td><strong>${row.highScore}</strong></td>
          <td class="ls-lbDim">${escapeHtml(formatDate(row.updatedAt))}</td>
        `;
        bodyEl.appendChild(tr);
      });
    } catch (error) {
      statusEl.textContent = `Leaderboard unavailable: ${error.message}`;
    }
  }

  refreshBtn.addEventListener("click", () => {
    refresh().catch(() => {});
  });

  return { refresh };
}
