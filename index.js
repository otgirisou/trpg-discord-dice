const { Client, GatewayIntentBits } = require("discord.js");

// ===== 起動確認 =====
console.log("★★ 最新コード確認 ★★");

// ===== Discord Client =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== エラー防止 =====
process.on("uncaughtException", err => {
  console.error("❌ 未処理エラー:", err);
});
process.on("unhandledRejection", err => {
  console.error("❌ Promiseエラー:", err);
});

// ===== Bot起動 =====
client.once("ready", () => {
  console.log(`Bot起動完了: ${client.user.tag}`);
});

// ===== 安全返信 =====
function safeReply(message, content) {
  message.reply(content).catch(err => {
    console.error("返信エラー:", err);
  });
}

// ===== ダイス =====
function rollAndCalc(input) {
  let formula = input
    .replace(/×|＊/g, "*")
    .replace(/÷/g, "/")
    .replace(/\s+/g, "");

  const hasDice = /(\d+)d(\d+)/i.test(formula);
  const hasSlash = /\//.test(formula);
  const hasDivisionMark = /÷/.test(input);

  if (hasSlash && !hasDice && !hasDivisionMark) return null;

  formula = formula.replace(/(\d+)d(\d+)/gi, (_, c, s) => {
    let sum = 0;
    for (let i = 0; i < Number(c); i++) {
      sum += Math.floor(Math.random() * Number(s)) + 1;
    }
    return sum;
  });

  if (!/^[0-9+\-*\/().]+$/.test(formula)) return null;

  try {
    return Function(`"use strict"; return (${formula})`)();
  } catch {
    return null;
  }
}

// ===== 成功判定 =====
function successCheck(target) {
  const roll = Math.floor(Math.random() * 100) + 1;
  let result = roll <= target ? "成功" : "失敗";
  if (roll <= 5) result += "（クリティカル）";
  if (roll >= 95) result += "（ファンブル）";
  return { roll, result };
}

// ===== よしよし =====
function getYoshiyoshi() {
  const list = [
    "(>⩊<)",
    "(ˆ. ̫ .ˆ)",
    "ฅ^. ̫.^ฅ",
    "( ˶`﹀´˵ )",
    "(◦`꒳´◦)"
    "ｰ̀⩊ｰ́",
    "(˶ˊᵕˋ˵)",
    "(๑°ㅁ°๑)",
  ];
  return list[Math.floor(Math.random() * list.length)];
}

// ===== メッセージ処理 =====
client.on("messageCreate", (message) => {
  try {
    if (message.author.bot) return;

    const msg = message.content.trim();

    // ===== デバッグ =====
    console.log("受信:", msg);

    // ===== よしよし（最終版：完全対応）=====
    const normalized = msg
      .normalize("NFKC")
      .replace(/\s+/g, "")
      .replace(/[！!。．\.]+$/, "");

    if (normalized === "ダイスボットよしよし") {
      console.log("よしよし発動:", normalized);
      safeReply(message, getYoshiyoshi());
      return;
    }
    // ===== もちもち =====
function getYoshiyoshi() {
  const list = [
    "(ﾉ)•ω•(ヾ)",
    "(っ•ω•⊂)",
    "(⊃)•  ̫ •(⊂)",
    "(ﾉ)`∨´(ヾ)",
  ];
  return list[Math.floor(Math.random() * list.length)];
}

// ===== メッセージ処理 =====
client.on("messageCreate", (message) => {
  try {
    if (message.author.bot) return;

    const msg = message.content.trim();

    // ===== デバッグ =====
    console.log("受信:", msg);

    // ===== よしよし（最終版：完全対応）=====
    const normalized = msg
      .normalize("NFKC")
      .replace(/\s+/g, "")
      .replace(/[！!。．\.]+$/, "");

    if (normalized === "ダイスボットもちもち") {
      console.log("もちもち発動:", normalized);
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

// ===== ログイン =====
client.login(process.env.DISCORD_TOKEN);
