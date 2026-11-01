/**
 * ============================================================
 *  Step 1 · 三个实验 —— 把 LLM API 的行为亲眼看一遍
 *
 *  实验 1：换个问题      → 它不是查资料，是「生成」
 *  实验 2：temperature=0 → 同样的问题，答案一字不差（确定性）
 *  实验 3：换 system    → system 决定它「是谁」
 *
 *  运行：node step1-experiments.js
 *  Key 从环境变量读取，不会写入磁盘
 * ============================================================
 */

const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";
const API_KEY = process.env.DEEPSEEK_API_KEY;

/** 统一的调用函数，方便反复调用做对比 */
async function ask(system, user, temperature = 0.7) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature,
      max_tokens: 300,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} → ${JSON.stringify(data)}`);
  }
  return {
    answer: data.choices[0].message.content,
    usage: data.usage,
  };
}

function line(char = "─") {
  console.log(char.repeat(64));
}

async function main() {
  if (!API_KEY) {
    console.error("❌ 没有读到 API Key");
    process.exit(1);
  }

  console.log("\n🔬 开始实验 · 模型：" + MODEL + "\n");

  // ==========================================================
  // 实验 1：同一个「角色」，问不同领域的问题
  // ==========================================================
  line("═");
  console.log("实验 1 ｜ 它是「查资料」还是「生成」？");
  line("═");

  const q1 = await ask(
    "你是一个耐心的编程导师，回答简洁务实。",
    "用一句话解释什么是 API。"
  );
  console.log("\n【问】什么是 API？");
  console.log("【答】" + q1.answer);

  const q2 = await ask(
    "你是一个耐心的编程导师，回答简洁务实。",
    "用一句话解释什么是篮球的「挡拆」。"
  );
  console.log("\n【问】什么是篮球的「挡拆」？   ← 完全不同的领域");
  console.log("【答】" + q2.answer);
  console.log("\n💡 观察：两个问题毫不相干，它都能答。说明它不是在数据库里");
  console.log("   「查」答案，而是根据训练中学到的语言规律「生成」答案。\n");

  // ==========================================================
  // 实验 2：temperature = 0 → 确定性
  // ==========================================================
  line("═");
  console.log("实验 2 ｜ temperature 调到 0 会发生什么？");
  line("═");

  const t0a = await ask(
    "你是一个耐心的编程导师。",
    "用一句话解释什么是数据库索引。",
    0 // 关键：温度归零
  );
  const t0b = await ask(
    "你是一个耐心的编程导师。",
    "用一句话解释什么是数据库索引。",
    0
  );

  console.log("\n【第 1 次】temperature = 0");
  console.log(t0a.answer);
  console.log("\n【第 2 次】temperature = 0（同样的问题，同样的设置）");
  console.log(t0b.answer);
  console.log("\n🔍 两次回答完全一致？ → " + (t0a.answer === t0b.answer ? "是 ✅" : "否 ❌"));

  const t07a = await ask(
    "你是一个耐心的编程导师。",
    "用一句话解释什么是数据库索引。",
    0.7
  );
  const t07b = await ask(
    "你是一个耐心的编程导师。",
    "用一句话解释什么是数据库索引。",
    0.7
  );
  console.log("🔍 同样问题但 temperature = 0.7，两次一致？ → " + (t07a.answer === t07b.answer ? "是" : "否 ❌（每次都不同）"));
  console.log("\n💡 观察：温度 = 0 时模型走「最优路径」，输出可复现。");
  console.log("   这就是为什么做批量数据处理（比如给 1000 条评论打标签）");
  console.log("   必须用 temperature = 0 —— 否则每次跑结果都不一样，没法验证。\n");

  // ==========================================================
  // 实验 3：system 决定它「是谁」
  // ==========================================================
  line("═");
  console.log("实验 3 ｜ 换掉 system 这句话，AI 会变成谁？");
  line("═");

  const s1 = await ask(
    "你是一个耐心的编程导师，回答简洁务实，用 JavaScript举例。",
    "什么是闭包？"
  );
  console.log("\n【system】你是一个耐心的编程导师，回答简洁务实，用 JavaScript举例。");
  console.log("【答】" + s1.answer);

  const s2 = await ask(
    "你是一个极其毒舌但有趣的脱口秀演员，用段子讲技术。",
    "什么是闭包？"
  );
  console.log("\n【system】你是一个极其毒舌但Funny的脱口秀演员，用段子讲技术。");
  console.log("【答】" + s2.answer);

  console.log("\n💡 观察：同一个问题，system 一换，语气和内容组织方式全变。");
  console.log("   system = 给 AI 定的「人设 + 规则 + 风格」。\n");

  // ==========================================================
  // 成本结算
  // ==========================================================
  line("═");
  console.log("💰 本次实验总共消耗");
  line("═");
  const totalIn = q1.usage.prompt_tokens + q2.usage.prompt_tokens + t0a.usage.prompt_tokens
    + t0b.usage.prompt_tokens + t07a.usage.prompt_tokens + t07b.usage.prompt_tokens
    + s1.usage.prompt_tokens + s2.usage.prompt_tokens;
  const totalOut = q1.usage.completion_tokens + q2.usage.completion_tokens + t0a.usage.completion_tokens
    + t0b.usage.completion_tokens + t07a.usage.completion_tokens + t07b.usage.completion_tokens
    + s1.usage.completion_tokens + s2.usage.completion_tokens;
  console.log("   调用次数：8 次");
  console.log("   输入 tokens：" + totalIn);
  console.log("   输出 tokens：" + totalOut);
  console.log("   合计：" + (totalIn + totalOut) + " tokens");
  console.log("\n   按 DeepSeek V4-Flash 价格（约 ¥0.2-2 元/百万 token）估算，");
  console.log("   这一整套实验大概 cost 不到 0.01 元 —— 比一瓶水还便宜。\n");
  console.log("🎉 恭喜，你已经亲手验证了 LLM 的三个核心行为。");
  console.log("   下一步 Step 2：把密钥藏到后端去。\n");
}

main().catch((e) => {
  console.error("\n❌ 出错了：" + e.message);
  process.exit(1);
});
