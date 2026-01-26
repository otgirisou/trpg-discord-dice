const Discord = require("discord.js");
const client = new Discord.Client();

/* =========================
   起動確認
========================= */
client.on("ready", () => {
  console.log(`ログインしました: ${client.user.tag}`);
  client.user.setActivity("TRPGダイス", { type: "PLAYING" });
});

/* =========================
   メッセージ受信
========================= */
client.on("message", message => {
  if (message.author.bot) return;
  const content = message.content.trim();

  /* =========================
     🎲 通常ダイス（例: 1d6+2 / 1d3+1d4-1）
  ========================= */
  if (/^\d+d\d+/i.test(content)) {
    try {
      const expr = content.replace(/d/gi, "D");
      let total = 0;
      let detail = expr;

      detail = detail.replace(/(\d+)D(\d+)/g, (m, dice, face) => {
        let sum = 0;
        let rolls = [];
        for (let i = 0; i < Number(dice); i++) {
          const r = Math.floor(Math.random() * Number(face)) + 1;
          rolls.push(r);
          sum += r;
        }
        total += sum;
        return `(${rolls.join(",")})`;
      });

      total = eval(detail.replace(/[()]/g, ""));
      message.channel.send(`🎲 ${content} → ${total}`);
    } catch {
      message.channel.send("⚠️ ダイス式が不正です");
    }
    return;
  }

  /* =========================
     🎯 成功判定（例: 成功判定 60）
  ========================= */
  if (content.startsWith("成功判定")) {
    const target = Number(content.replace("成功判定", "").trim());
    if (isNaN(target)) {
      message.channel.send("成功判定 数値 の形式で入力してください");
      return;
    }

    const roll = Math.floor(Math.random() * 100) + 1;
    let result = roll <= target ? "成功" : "失敗";

    if (roll <= 5 && result === "成功") result += "（クリティカル）";
    if (roll >= 95 && result === "失敗") result += "（ファンブル）";

    message.channel.send(`🎯 成功判定(${target}) → ${roll} ：${result}`);
    return;
  }

  /* =========================
     🧠 短期狂気表
  ========================= */
  if (["一時的狂気","短期的狂気","短期狂気"].includes(content)) {
    const table = [
      "気絶あるいは金切り声の発作",
      "パニック状態で逃げ出す",
      "肉体的ヒステリーや感情の噴出",
      "早口で意味不明の会話",
      "極度の恐怖症",
      "殺人癖あるいは自殺癖",
      "幻覚あるいは妄想",
      "反響動作あるいは反響言語",
      "異様なものを食べたがる",
      "昏迷あるいは緊張症"
    ];
    const roll = Math.floor(Math.random() * 10);
    message.channel.send(`🧠 短期狂気(${roll+1})：${table[roll]}`);
    return;
  }

  /* =========================
     🧠 長期狂気表
  ========================= */
  if (["長期的狂気","長期狂気","不定の狂気","不定狂気"].includes(content)) {
    const table = [
      "健忘症または昏迷／緊張症",
      "激しい恐怖症",
      "幻覚",
      "奇妙な性的嗜好",
      "フェティッシュ",
      "制御不能のチックや会話不能",
      "心因性障害",
      "短時間の心因反応",
      "一時的偏執症",
      "強迫観念に取りつかれた行動"
    ];
    const roll = Math.floor(Math.random() * 10);
    message.channel.send(`🧠 長期狂気(${roll+1})：${table[roll]}`);
    return;
  }

  /* =========================
     🗡 ダメージ表（拡張版）
  ========================= */
  if (content.startsWith("ダメージ")) {
    const weapon = content.replace(/^ダメージ\s*/,"");

    const damageTable = {
      "素手":"1D6-2","パンチ":"1D6-2","キック":"1D6-2","頭突き":"1D6-2",
      "体当たり":"1D6-2","投げ":"1D6-2","引き倒し":"1D6-2",
      "絞め":"1D6","首絞め":"1D6",
      "ナックル":"1D6","スパイク靴":"1D6",
      "ポケットナイフ":"1D6-2","小型ナイフ":"1D6-2","メス":"1D6-2",
      "ナイフ":"1D6","軍用ナイフ":"2D6-2","包丁":"2D6-2",
      "木刀":"1D6","フルーレ":"2D6-2","模造刀":"2D6-2","仕込み杖":"2D6-2",
      "サーベル":"2D6","小太刀":"2D6","日本刀":"3D6-2","脇差":"3D6-2",
      "大太刀":"3D6","古刀":"3D6","長脇差":"3D6",
      "草刈り鎌":"1D6+2","山刀":"1D6+2","ナタ":"1D6+2",
      "手斧":"2D6","大ナタ":"2D6","木こり斧":"3D6",
      "杖":"1D6-2","ステッキ":"1D6-2","警棒":"1D6","大型の木槌":"1D6",
      "ブラックジャック":"1D6+2","棍棒":"1D6+2","金槌":"1D6+2","鉄杖":"1D6+2",
      "バール":"2D6-2","大型ハンマー":"2D6-2","金属警棒":"2D6-2",
      "つるはし":"2D6+2","破壊槌":"2D6+2",
      "短槍":"2D6-2","銛":"2D6-2","銃剣":"2D6",
      "長槍":"3D6-2","薙刀":"3D6-2","三又槍":"3D6-2",
      "鉄パイプ":"2D6-2",
      "投石":"1D6","和弓":"3D6-2","アーチェリー":"3D6-2","ボウガン":"3D6",
      "小口径拳銃":"2D6","中口径拳銃":"3D6","大口径拳銃":"3D6+2",
      "小口径ライフル":"3D6+2","中口径ライフル":"4D6+2",
      "小口径ショットガン":"3D6+2","中口径ショットガン":"4D6+2"
    };

    if (damageTable[weapon]) {
      message.channel.send(`🗡 ${weapon} / ${damageTable[weapon]}`);
    } else {
      message.channel.send("❓ その武器は登録されていません");
    }
    return;
  }

});

/* =========================
   ログイン
========================= */
client.login(process.env.DISCORD_TOKEN);
