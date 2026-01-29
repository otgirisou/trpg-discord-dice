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
});

// ===== ダイス展開＋計算 =====
function rollAndCalc(input) {
  let original = input.trim();

  let formula = original
    .replace(/×|＊/g, "*")
    .replace(/÷/g, "/")
    .replace(/\s+/g, "");

  const hasDice = /(\d+)d(\d+)/i.test(formula);
  const hasSlash = /\//.test(formula);
  const hasDivisionMark = /÷/.test(original);

  // / はダイスがある時のみ許可（÷は例外）
  if (hasSlash && !hasDice && !hasDivisionMark) return null;

  // ダイス展開
  formula = formula.replace(/(\d+)d(\d+)/gi, (_, c, s) => {
    let sum = 0;
    for (let i = 0; i < Number(c); i++) {
      sum += Math.floor(Math.random() * Number(s)) + 1;
    }
    return sum;
  });

  // 安全チェック
  if (!/^[0-9+\-*\/().]+$/.test(formula)) return null;

  const total = Function(`"use strict"; return (${formula})`)();
  return total;
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

  // 四則演算・ダイス
  if (/^[0-9dD+\-×÷＊*/().\s]+$/.test(msg)) {
    const result = rollAndCalc(msg);
    if (result === null) return;

    message.reply(String(result));
    return;
  }

  // 成功判定
  if (msg.startsWith("成功判定")) {
    const target = parseInt(msg.replace("成功判定", "").trim(), 10);
    if (isNaN(target)) return;

    const r = successCheck(target);
    message.reply(
      `出目: ${r.roll}\n結果: ${r.result}`
    );
  }
});

// ===== Discordログイン =====
client.login(process.env.DISCORD_TOKEN);
