/**
 * ============================================================
 *  Step 1 · 练习版 —— 关键部分留给你自己填
 *
 *  用法：先把下面的 TODO 都填上，然后运行
 *        node step1-practice.js
 *
 *  填不动的地方，看 step1-first-call.js 对应位置，或者随时问我。
 *  提示：答案在文件末尾的「参考答案」区，但先自己想 5 分钟再看。
 * ============================================================
 */

const API_URL = "TODO-1";           // ← 填 DeepSeek 的接口地址
const MODEL = "TODO-2";             // ← 填模型名
const API_KEY = process.env.DEEPSEEK_API_KEY;   // ← 这行不用改

async function main() {
  if (!API_KEY) {
    console.error("❌ 没有读到 API Key，先设置环境变量");
    process.exit(1);
  }

  const response = await fetch(API_URL, {
    method: "TODO-3",                // ← 填 HTTP 方法
    headers: {
      "Content-Type": "TODO-4",      // ← 填内容类型
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        // TODO-5: 补上 system 和 user 两条消息
        //   system → 设定 AI 的身份/风格
        //   user   → 你想问的问题
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  console.log("HTTP 状态码：" + response.status);

  const data = await response.json();

  if (!response.ok) {
    console.error("❌ 失败：" + JSON.stringify(data, null, 2));
    process.exit(1);
  }

  // TODO-6: 从返回的 JSON 里取出答案，赋值给 answer
  //   提示：答案在 data.choices[0].message.content
  const answer = "TODO-6";
  console.log("\n🤖 AI 的回答：\n" + answer);
}

main();

/* ============================================================
 * 参考答案（先自己想，别直接抄）
 *
 * TODO-1 → "https://api.deepseek.com/chat/completions"
 * TODO-2 → "deepseek-chat"
 * TODO-3 → "POST"
 * TODO-4 → "application/json"
 * TODO-5 → { role: "system", content: "你是一个耐心的编程导师，回答简洁。" },
 *          { role: "user",   content: "用一句话解释什么是 API。" }
 * TODO-6 → data.choices[0].message.content
 * ============================================================ */
