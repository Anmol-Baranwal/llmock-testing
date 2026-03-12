import { LLMock } from "@copilotkit/llmock";

const mock = new LLMock({ port: 5555 });

// user sends message → agent plans with write_todos
mock.addFixture({
  match: {
    predicate: (req) => {
      const msgs = req.messages ?? [];
      const hasTool = msgs.some((m) => m.role === "tool");
      const lastUser = [...msgs].reverse().find((m) => m.role === "user");
      return !hasTool && lastUser?.content?.includes("quantum");
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

// write_todos completed → agent writes final report
mock.addFixture({
  match: {
    predicate: (req) => {
      const msgs = req.messages ?? [];
      const last = msgs.at(-1);
      if (last?.role !== "tool") return false;
      const lastAsst = [...msgs].reverse().find((m) => m.role === "assistant");
      const toolName =
        lastAsst?.tool_calls?.[0]?.function?.name ??
        lastAsst?.tool_calls?.[0]?.name ??
        "none";
      return toolName === "write_todos";
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

// write_file completed → agent sends final message
mock.addFixture({
  match: {
    predicate: (req) => {
      const msgs = req.messages ?? [];
      const last = msgs.at(-1);
      if (last?.role !== "tool") return false;
      const lastAsst = [...msgs].reverse().find((m) => m.role === "assistant");
      const toolName =
        lastAsst?.tool_calls?.[0]?.function?.name ??
        lastAsst?.tool_calls?.[0]?.name ??
        "none";
      return toolName === "write_file";
    },
  },
  response: {
    content:
      "I've completed your research on quantum computing and saved the report to /reports/final_report.md. Regards, LLMock",
  },
});

// catch-all
mock.addFixture({
  match: { predicate: () => true },
  response: { content: "How can I help?" },
});

mock
  .start()
  .then(() => {
    console.log(
      "\n🧪 llmock running on http://localhost:5555 (manual dev mode)",
    );
    console.log(
      "   → Start 'npm run dev' and 'cd agent && uv run python main.py'",
    );
    console.log(
      "   → Open http://localhost:3000 and test 'research quantum computing'",
    );
    console.log("   → Press Ctrl+C to stop\n");
  })
  .catch(console.error);
