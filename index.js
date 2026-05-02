client.on("messageCreate", (message) => {
  try {
    if (message.author.bot) return;

    const msg = message.content.trim();

    // ===== よしよし（最優先）=====
    const normalized = msg.replace(/\s+/g, "");
    if (
      normalized.includes("ダイスボット") &&
      normalized.includes("よしよし")
    ) {
      safeReply(message, getYoshiyoshi());
      return;
    }

    // ===== 数字のみ無視 =====
    if (/^\d+(\.\d+)?$/.test(msg)) return;

    // ===== ダイス・計算 =====
    if (
      /^[0-9dD+\-×÷＊*/().\s]+$/.test(msg) &&
      /[dD+\-×÷＊*/]/.test(msg)
    ) {
      const result = rollAndCalc(msg);
      if (result === null) return;

      safeReply(message, String(result));
      return;
    }

    // ===== 成功判定 =====
    if (msg.startsWith("成功判定")) {
      const target = parseInt(msg.replace("成功判定", "").trim(), 10);
      if (isNaN(target)) return;

      const r = successCheck(target);
      safeReply(message, `出目: ${r.roll}\n結果: ${r.result}`);
    }

  } catch (err) {
    console.error("処理エラー:", err);
  }
});
