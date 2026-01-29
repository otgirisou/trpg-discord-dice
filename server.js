// =========================
// server.js - TRPG Calculator Bot
// =========================
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// =========================
// メッセージ処理
// =========================
client.on("messageCreate", message => {
  if (message.author.bot) return;

  const original = message.content.trim();
  if (!original) return;

  try {
    const result = calculateExpression(original);
    if (result !== null) {
      message.channel.send(`${original} → ${result}`);
    }
  } catch (e) {
    // 無反応でOK（壊れ防止）
  }
});

// =========================
// 計算処理
// =========================
function calculateExpression(input) {
  let expr = input;

  // r を無視（r1 → 1）
  expr = expr.replace(/r/gi, "");

  // × ÷ を JS 演算子へ
  expr = expr.replace(/×/g, "*").replace(/÷/g, "/");

  // ダイス展開（1d10 など）
  expr = expr.replace(/(\d+)d(\d+)/gi, (_, c, s) => {
    return rollDice(Number(c), Number(s));
  });

  // 許可される文字だけチェック
  if (!/^[0-9+\-*/(). ]+$/.test(expr)) return null;

  // 計算
  const value = Function(`"use strict"; return (${expr})`)();
  return value;
}

// =========================
// ダイス
// =========================
function rollDice(count, sides) {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

// =========================
// Bot Token
// =========================
client.login("★ここにBotトークン★");
