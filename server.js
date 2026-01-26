const { Client, GatewayIntentBits } = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== ダイス関数 =====
function rollDice(times, sides) {
  let rolls = [];
  let total = 0;
  for (let i = 0; i < times; i++) {
    const r = Math.floor(Math.random() * sides) + 1;
    rolls.push(r);
    total += r;
  }
  return { rolls, total };
}

function calcDiceExpression(expr) {
  const parts = expr.match(/[+-]?[^+-]+/g);
  let total = 0;
  let detail = [];

  for (let part of parts) {
    let sign = 1;
    if (part.startsWith("+")) part = part.slice(1);
    if (part.startsWith("-")) {
      sign = -1;
      part = part.slice(1);
    }

    if (part.toLowerCase().includes("d")) {
      const [t, s] = part.toLowerCase().split("d").map(Number);
      const r = rollDice(t, s);
      total += sign * r.total;
      detail.push(`${sign === -1 ? "-" : ""}${t}D${s}[${r.rolls.join(",")}]`);
    } else {
      total += sign * Number(part);
      detail.push(`${sign === -1 ? "-" : ""}${part}`);
    }
  }

  return { total, detail: detail.join(" ") };
}

// ===== ダメージ表 =====
const damageTable = {
  "ナイフ": "1d6",
  "素手": "1d6-2",
  "パンチ": "1d6-2",
  "キック": "1d6-2",
  "頭突き": "1d6-2",
  "軍用ナイフ": "2d6-2",
  "包丁": "2d6-2",
  "日本刀": "3d6-2",
  "大太刀": "3d6",
  "鉄パイプ": "2d6-2",
  "角材": "1d6+2",
  "バット": "1d6+2",
};

// ===== 狂気表 =====
const shortMadness = {
  1: "気絶あるいは金切り声の発作",
  2: "パニック状態で逃げ出す",
  3: "肉体的ヒステリー、あるいは感情の噴出",
  4: "意味不明な会話や多弁症",
  5: "極度の恐怖症",
  6: "殺人癖あるいは自殺癖",
  7: "幻覚あるいは妄想",
  8: "反響動作あるいは反響言語",
  9: "異様なものを食べたがる",
  10: "昏迷あるいは緊張症"
};

const longMadness = {
  1: "健忘症あるいは昏迷/緊張症",
  2: "激しい恐怖症",
  3: "幻覚",
  4: "奇妙な性的嗜好",
  5: "フェティッシュ",
  6: "制御不能のチックや会話不能",
  7: "心因性視覚・聴覚・運動障害",
  8: "短時間の心因反応",
  9: "一時的偏執症",
  10: "強迫観念に取りつかれた行動"
};

// ===== メッセージ処理 =====
client.on("messageCreate", message => {
  if (message.author.bot) return;
  const text = message.content;

  // --- 短期（＝一時的）狂気 ---
  if (
    text.includes("一時的狂気") ||
    text.includes("短期的狂気") ||
    text.includes("短期狂気")
  ) {
    const r = rollDice(1, 10).total;
    message.reply(`🎭 短期の狂気（${r}）\n${shortMadness[r]}`);
    return;
  }

  // --- 長期（＝不定）狂気 ---
  if (
    text.includes("長期的狂気") ||
    text.includes("長期狂気") ||
    text.includes("不定の狂気") ||
    text.includes("不定狂気")
  ) {
    const r = rollDice(1, 10).total;
    message.reply(`🕯 不定の狂気（${r}）\n${longMadness[r]}`);
    return;
  }

  // --- ダメージ ---
  if (text.startsWith("ダメージ")) {
    const name = text.replace("ダメージ", "").trim();
    if (damageTable[name]) {
      const expr = damageTable[name];
      const r = calcDiceExpression(expr);
      message.reply(`🔪 ${name} / ${expr}\n${r.detail}\n**合計：${r.total}**`);
    } else {
      message.reply("その武器は登録されていません。");
    }
    return;
  }

  // --- 成功判定 ---
  if (text.startsWith("成功判定")) {
    const target = Number(text.replace("成功判定", "").trim());
    if (isNaN(target)) return;

    const roll = rollDice(1, 100).total;
    let result = "失敗";
    if (roll <= target) result = "成功";
    if (roll <= 5 && roll <= target) result = "🌟クリティカル";
    if (roll >= 95 && roll > target) result = "💀ファンブル";

    message.reply(`🎲 ${roll} / ${target}\n➡ ${result}`);
    return;
  }

  // --- 通常ダイス ---
  if (/^\d+d\d+/i.test(text)) {
    const r = calcDiceExpression(text);
    message.reply(`🎲 ${text}\n${r.detail}\n**合計：${r.total}**`);
  }
});

client.once("ready", () => {
  console.log(`ログイン完了：${client.user.tag}`);
});

client.login(TOKEN);
