const { Client, GatewayIntentBits } = require("discord.js");

// ===== Discord Client =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== Bot起動 =====
client.once("ready", () => {
  console.log(`Bot起動完了: ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: "TRPG", type: 0 }],
    status: "online"
  });
});

// ===== ダイス＋四則演算処理 =====
function rollAndCalc(input) {
  let formula = input
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/\s+/g, "");

  const rollDetails = [];

  // ダイス展開
  formula = formula.replace(/(\d+)d(\d+)/gi, (_, c, s) => {
    let sum = 0;
    const rolls = [];
    for (let i = 0; i < Number(c); i++) {
      const r = Math.floor(Math.random() * Number(s)) + 1;
      sum += r;
      rolls.push(r);
    }
    rollDetails.push(`${c}d${s}=[${rolls.join(", ")}]`);
    return sum;
  });

  // 安全チェック（数字・演算子・括弧のみ許可）
  if (!/^[0-9+\-*/().]+$/.test(formula)) return null;

  const total = Function(`"use strict"; return (${formula})`)();
  return { total, detail: rollDetails, formula };
}

// ===== 成功判定 =====
function successCheck(target) {
  const roll = Math.floor(Math.random() * 100) + 1;
  let result = roll <= target ? "成功" : "失敗";
  if (roll <= 5) result += "（クリティカル）";
  if (roll >= 95) result += "（ファンブル）";
  return { roll, result };
}

// ===== メッセージ処理 =====
client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  const msg = message.content.trim();

  // ダイス＋四則演算
  if (/[\dd×÷*/()+]/.test(msg) && msg.includes("d")) {
    const r = rollAndCalc(msg);
    if (!r) return;

    message.reply(
      `🎲 ${msg}\n` +
      `展開: ${r.detail.join(" / ")}\n` +
      `計算式: ${r.formula}\n` +
      `合計: **${r.total}**`
    );
    return;
  }

  // 成功判定
  if (msg.startsWith("成功判定")) {
    const target = parseInt(msg.replace("成功判定", "").trim(), 10);
    if (isNaN(target)) return;
    const r = successCheck(target);
    message.reply(
      `🎯 目標値:${target}\n出目:${r.roll}\n結果:${r.result}`
    );
  }
});

// ===== Discordログイン =====
client.login(process.env.DISCORD_TOKEN);
