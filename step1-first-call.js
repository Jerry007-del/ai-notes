/**
 * ============================================================
 *  Step 1 · 第一次调用大模型 API
 *  目标：让终端里蹦出 AI 的回答
 *  技术：Node.js 内置 fetch（零依赖，不需要 npm install）
 *  运行：node step1-first-call.js
 * ============================================================
 */

// 【第 1 行关键】API 地址。
// 大模型 API 本质就是一个 HTTP 接口：把请求发到这个地址，它返回 JSON。
// 用的是 OpenAI 兼容格式，所以 DeepSeek / 通义 / 智谱 都是同一个格式，
// 学会一家就等于学会全部 —— 以后换模型只要改 URL 和 model 两个字段。
const API_URL = "https://api.deepseek.com/chat/completions";

// 模型名。DeepSeek 有两个：
//   deepseek-chat      → 通用对话（推荐先用这个）
//   deepseek-reasoner  → 带思维链推理，慢且贵，别一上来就用
const MODEL = "deepseek-chat";

// 【安全红线】API Key 从环境变量读取，绝不写死在代码里。
// 原因：代码会推到 GitHub 公开仓库，写死 = 把密码贴在公告栏上。
// 别人的爬虫几分钟就能扫到，然后疯狂用你的额度（烧你的钱）。
const API_KEY = process.env.DEEPSEEK_API_KEY;

/**
 * 主函数：真正发请求的逻辑
 */
async function main() {
  // ---- 安全检查：没读到 Key 就直接退出，别带着 undefined 去请求 ----
  if (!API_KEY) {
    console.error("❌ 没有读到 API Key！");
    console.error("");
    console.error("请先设置环境变量，再运行本脚本：");
    console.error("");
    console.error("  PowerShell（当前窗口临时生效）：");
    console.error("    $env:DEEPSEEK_API_KEY = \"sk-你的key\"");
    console.error("");
    console.error("  或者永久设置（推荐，之后所有终端都能用）：");
    console.error("    setx DEEPSEEK_API_KEY \"sk-你的key\"");
    console.error("    （setx 之后要重开一个终端窗口才生效）");
    process.exit(1);
  }

  console.log("📡 正在请求 DeepSeek ...");
  console.log("   模型：" + MODEL);
  console.log("");

  // ---- 核心：这行 fetch 就是"打电话给模型" ----
  try {
    const response = await fetch(API_URL, {
      method: "POST",

      // 请求头：告诉服务器"我发的是 JSON，这是我的钥匙"
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,   // Bearer 是认证方式，后面跟 Key
      },

      // 请求体：真正要说的内容
      body: JSON.stringify({
        model: MODEL,

        // messages = 对话历史数组。这是和 LLM 沟通的核心数据结构。
        // 它不像普通函数调用那样"你问一句我答一句"，而是把整个对话都带上，
        // 模型每次都"重新读一遍全部聊天记录"再回答。
        messages: [
          {
            role: "system",
            content: "你是一个耐心的编程导师。回答简洁务实，给代码时用 JavaScript。",
          },
          {
            role: "user",
            content: "用一句话解释什么是 API。",
          },
        ],

        // temperature：随机性。0 = 每次都一样（严谨任务用），
        // 1 = 更有创意（写文案、头脑风暴用）。0.7 是通用值。
        temperature: 0.7,

        // max_tokens：最多生成多少个 token（字）。限制成本 + 控制长度。
        max_tokens: 500,
      }),
    });

    // ---- 状态码：后端给你的"心情"。200 = 成功 ----
    console.log("✅ HTTP 状态码：" + response.status);

    // 把返回的 JSON 转成 JS 对象
    const data = await response.json();

    // 失败处理：API 出错时也会返回 JSON，但里面是错误信息
    if (!response.ok) {
      console.error("");
      console.error("❌ 调用失败，服务器返回：");
      console.error(JSON.stringify(data, null, 2));
      console.error("");
      console.error("常见原因：");
      console.error("  · 401 → Key 错了或过期，检查是否复制完整（别带空格）");
      console.error("  · 402 → 余额不足，去 platform.deepseek.com 充值");
      console.error("  · 429 → 请求太频繁，等几秒再试");
      console.error("  · 400 → 请求体有问题，检查 model 名是否写对");
      process.exit(1);
    }

    // ---- 成功：取出答案 ----
    // 响应结构：data.choices[0].message.content
    // （choices = 候选答案列表，通常只有 1 个；[0] = 取第一个）
    const answer = data.choices[0].message.content;

    console.log("");
    console.log("=".repeat(50));
    console.log("🤖 AI 的回答：");
    console.log("=".repeat(50));
    console.log(answer);
    console.log("=".repeat(50));
    console.log("");
    console.log("📊 本次消耗：");
    console.log("   输入 tokens：" + (data.usage?.prompt_tokens ?? "未知"));
    console.log("   输出 tokens：" + (data.usage?.completion_tokens ?? "未知"));
    console.log("");
    console.log("🎉 恭喜，你刚刚完成了一次真实的 AI API 调用。");
  } catch (err) {
    // 网络层错误（断网、代理拦截、DNS 失败）会走到这里
    console.error("❌ 请求失败：" + err.message);
    console.error("");
    console.error("如果报 fetch failed，大概率是网络问题：");
    console.error("  · 检查电脑是否连着网");
    console.error("  · 关掉 VPN / 加速器试试（国内 API 一般不需要加速）");
    console.error("  · 之前遇到过代理变量把请求带偏的情况，可临时执行：");
    console.error("      $env:HTTP_PROXY=\"\"");
    console.error("      $env:HTTPS_PROXY=\"\"");
    process.exit(1);
  }
}

// 调用 main 函数
main();
