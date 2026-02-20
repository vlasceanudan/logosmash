function encodeValue(value) {
  return encodeURIComponent(value);
}

function validateNickname(nickname) {
  const cleaned = String(nickname || "").trim();
  if (cleaned.length < 2 || cleaned.length > 20) {
    return { valid: false, cleaned, reason: "Nickname must be 2-20 characters." };
  }
  return { valid: true, cleaned, reason: "" };
}

export function createLeaderboardClient(env) {
  const baseUrl = String(env?.SUPABASE_URL || "").trim().replace(/\/$/, "");
  const anonKey = String(env?.SUPABASE_ANON_KEY || "").trim();

  if (!baseUrl || !anonKey) {
    return {
      async getTopScores() {
        throw new Error("Leaderboard not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.");
      },
      async submitScore() {
        throw new Error("Leaderboard not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.");
      }
    };
  }

  const endpoint = `${baseUrl}/rest/v1/logo_smash_scores`;

  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    "Content-Type": "application/json"
  };

  async function getTopScores(limit = 10) {
    const url = `${endpoint}?select=id,nickname,high_score,updated_at&order=high_score.desc,updated_at.desc&limit=${Number(limit) || 10}`;
    const response = await fetch(url, {
      method: "GET",
      headers
    });

    if (!response.ok) {
      throw new Error(`Leaderboard fetch failed (${response.status}).`);
    }

    const rows = await response.json();
    return rows.map((row) => ({
      id: row.id,
      nickname: row.nickname,
      highScore: Number(row.high_score || 0),
      updatedAt: row.updated_at
    }));
  }

  async function submitScore(entry) {
    const score = Number(entry?.score);
    if (!Number.isFinite(score) || score < 0) {
      return { saved: false, reason: "Invalid score." };
    }

    const nicknameValidation = validateNickname(entry?.nickname);
    if (!nicknameValidation.valid) {
      return { saved: false, reason: nicknameValidation.reason };
    }

    const nickname = nicknameValidation.cleaned;
    const existingUrl = `${endpoint}?select=id,nickname,high_score,updated_at&nickname=ilike.${encodeValue(nickname)}&limit=1`;

    const existingResponse = await fetch(existingUrl, {
      method: "GET",
      headers
    });

    if (!existingResponse.ok) {
      return { saved: false, reason: `Lookup failed (${existingResponse.status}).` };
    }

    const existingRows = await existingResponse.json();
    const existing = existingRows[0];

    if (!existing) {
      const createResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          ...headers,
          Prefer: "return=representation"
        },
        body: JSON.stringify({ nickname, high_score: score })
      });

      if (!createResponse.ok) {
        return { saved: false, reason: `Create failed (${createResponse.status}).` };
      }

      return { saved: true, reason: "Score saved." };
    }

    const previousHighScore = Number(existing.high_score || 0);
    if (score <= previousHighScore) {
      return {
        saved: false,
        reason: `Not saved: your high score is ${previousHighScore}.`,
        previousHighScore
      };
    }

    const updateUrl = `${endpoint}?id=eq.${encodeValue(existing.id)}`;
    const updateResponse = await fetch(updateUrl, {
      method: "PATCH",
      headers: {
        ...headers,
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        nickname,
        high_score: score,
        updated_at: new Date().toISOString()
      })
    });

    if (!updateResponse.ok) {
      return { saved: false, reason: `Update failed (${updateResponse.status}).` };
    }

    return {
      saved: true,
      reason: `Updated from ${previousHighScore} to ${score}.`,
      previousHighScore
    };
  }

  return {
    getTopScores,
    submitScore
  };
}
