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

// ===== ダイス計算 =====
function rollDice(formula) {
  const parts = formula.replace(/\s+/g, "").replace(/-/g, "+-").split("+");
  let total = 0;
  let details = [];

  for (const part of parts) {
    if (part.includes("d")) {
      let [c, s] = part.split("d").map(Number);
      for (let i = 0; i < c; i++) {
        const r = Math.floor(Math.random() * s) + 1;
        total += r;
        details.push(r);
      }
    } else {
      const n = Number(part);
      if (!isNaN(n)) {
        total += n;
        details.push(n);
      }
    }
  }
  return { total, details };
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

  // ダイスロール
  if (/^\d+d\d+([+-]\d+d?\d+)*$/i.test(msg)) {
    const r = rollDice(msg);
    message.reply(
      `🎲 ${msg}\n出目: [${r.details.join(", ")}]\n合計: **${r.total}**`
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
