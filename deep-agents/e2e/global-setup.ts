import { LLMock } from "@copilotkit/llmock";

/* eslint-disable @typescript-eslint/no-explicit-any */
let mock: LLMock;
const counts = { step1: 0, step2: 0, step3: 0, catchall: 0 };

export default async function setup() {
  mock = new LLMock({ port: 5555 });
  counts.step1 = 0;
  counts.step2 = 0;
  counts.step3 = 0;
  counts.catchall = 0;

  mock.addFixture({
    match: {
      predicate: (req: any) => {
        const msgs = req.messages ?? [];
        const hasTool = msgs.some((m: any) => m.role === "tool");
        const lastUser = [...msgs]
          .reverse()
          .find((m: any) => m.role === "user");
        const result = !hasTool && lastUser?.content?.includes("quantum");
        if (result) counts.step1++;
        return result;
      },
    },
    response: {
      toolCalls: [
        {
          name: "write_todos",
          arguments: JSON.stringify({
            todos: [
              {
                id: "1",
                content: "Research quantum computing basics",
                status: "pending",
              },
              {
                id: "2",
                content: "Investigate quantum hardware developments",
                status: "pending",
              },
              {
                id: "3",
                content: "Compile and write final report",
                status: "pending",
              },
            ],
          }),
        },
      ],
    },
  });

  mock.addFixture({
    match: {
      predicate: (req: any) => {
        const msgs = req.messages ?? [];
        const last = msgs.at(-1);
        if (last?.role !== "tool") return false;
        const lastAsst = [...msgs]
          .reverse()
          .find((m: any) => m.role === "assistant");
        const toolName =
          lastAsst?.tool_calls?.[0]?.function?.name ??
          lastAsst?.tool_calls?.[0]?.name ??
          "none";
        const result = toolName === "write_todos";
        if (result) counts.step2++;
        return result;
      },
    },
    response: {
      toolCalls: [
        {
          name: "write_file",
          arguments: JSON.stringify({
            file_path: "/reports/final_report.md",
            content:
              "# Quantum Computing Report\n\nQuantum computing leverages qubits for exponential speedup.\n\n## Key Findings\n\n- Qubits enable superposition and entanglement\n- Key players: IBM, Google, IonQ\n\n## Conclusion\n\nQuantum computing will transform industries within the next decade.",
          }),
        },
      ],
    },
  });

  mock.addFixture({
    match: {
      predicate: (req: any) => {
        const msgs = req.messages ?? [];
        const last = msgs.at(-1);
        if (last?.role !== "tool") return false;
        const lastAsst = [...msgs]
          .reverse()
          .find((m: any) => m.role === "assistant");
        const toolName =
          lastAsst?.tool_calls?.[0]?.function?.name ??
          lastAsst?.tool_calls?.[0]?.name ??
          "none";
        const result = toolName === "write_file";
        if (result) counts.step3++;
        return result;
      },
    },
    response: {
      content:
        "I've completed your research on quantum computing and saved the report to /reports/final_report.md.",
    },
  });

  mock.addFixture({
    match: {
      predicate: () => {
        counts.catchall++;
        return true;
      },
    },
    response: { content: "How can I help?" },
  });

  await mock.start();

  process.env.OPENAI_BASE_URL = "http://localhost:5555/v1";
  process.env.OPENAI_API_KEY = "mock-key";
  process.env.LLMOCK_URL = "http://localhost:5555";

  console.log("\n🧪 llmock running on http://localhost:5555");
  console.log("   ↳ Python agent (port 8123) OpenAI calls → intercepted ✅");
  console.log("   ↳ Next.js (port 3000) OpenAI calls      → intercepted ✅");
  console.log("   ↳ Tavily search calls                   → real internet ✅");
  console.log(`   ↳ ${mock.getFixtures().length} fixtures loaded\n`);

  (global as any).__llmock = mock;
}

export async function teardown() {
  const mock = (global as any).__llmock as LLMock;
  const total = mock.getRequests().length;

  console.log(`\n📋 llmock — ${total} calls intercepted`);
  console.log(`   write_todos fired:   ${counts.step1}x  → research plan ⚡`);
  console.log(`   write_file fired:    ${counts.step2}x  → final report  ⚡`);
  console.log(`   final message fired: ${counts.step3}x  → agent done    ⚡`);
  if (counts.catchall > 0)
    console.log(`   catch-all fired:     ${counts.catchall}x ⚠️`);
  console.log(`   $0.00 total\n`);

  await mock.stop();
  console.log("🛑 llmock stopped\n");
}
