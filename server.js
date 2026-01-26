const { 
  Client, 
  GatewayIntentBits 
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

/* =========================
   起動時
========================= */
client.once("ready", () => {
  console.log("Bot準備完了～");
  client.user.setPresence({
    activities: [{ name: "TRPGセッション", type: 0 }],
    status: "online"
  });
});

/* =========================
   メッセージ処理
========================= */
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  /* ---- 成功判定 ---- */
  const successMatch = content.match(/^成功判定\s+(\d{1,3})$/);
  if (successMatch) {
    const target = parseInt(successMatch[1], 10);

    if (target < 1 || target > 100) {
      message.channel.send("目標値は1〜100で指定してください。");
      return;
    }

    const roll = Math.floor(Math.random() * 100) + 1;

    let result = "失敗";
    if (roll <= target) result = "成功";

    if (roll <= 5 && roll <= target) {
      result = "🎉 クリティカル成功！";
    } else if (roll >= 95 && roll > target) {
      result = "💥 ファンブル！";
    }

    message.channel.send(
      `🎯 成功判定（目標値 ${target}）\n出目: ${roll} → ${result}`
    );
    return;
  }

  /* ---- 通常ダイス（1d6 / 1d3+1d4 / 2d6-1 等） ---- */
  const diceExpr = content.replace(/\s+/g, "");
  if (/^[0-9dD+\-]+$/.test(diceExpr)) {
    try {
      const parts = diceExpr.match(/[+\-]?[^+\-]+/g);
      let total = 0;
      let detail = [];

      for (const part of parts) {
        const sign = part.startsWith("-") ? -1 : 1;
        const p = part.replace(/^[-+]/, "");

        if (p.includes("d")) {
          const [c, s] = p.toLowerCase().split("d").map(Number);
          const rolls = Array.from({ length: c }, () => Math.floor(Math.random() * s) + 1);
          const sum = rolls.reduce((a, b) => a + b, 0);
          total += sign * sum;
          detail.push(`${sign < 0 ? "-" : ""}${c}d${s}[${rolls.join(",")}]`);
        } else {
          total += sign * Number(p);
          detail.push(part);
        }
      }

      message.channel.send(
        `🎲 ${content}\n結果: ${detail.join(" ")}\n合計: ${total}`
      );
    } catch {
      message.channel.send("ダイス式を正しく入力してください。");
    }
  }
});

/* =========================
   ログイン
========================= */
client.login(process.env.DISCORD_TOKEN);
