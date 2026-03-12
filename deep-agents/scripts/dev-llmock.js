import { LLMock } from "@copilotkit/llmock";

const mock = new LLMock({ port: 5555 });

// user asks → plan todos
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
              status: "in_progress",
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

// write_todos done → research basics
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
      return (
        toolName === "write_todos" &&
        msgs.filter((m) => m.role === "tool").length === 1
      );
    },
  },
  response: {
    toolCalls: [
      {
        name: "research",
        arguments: JSON.stringify({ query: "quantum computing basics" }),
      },
    ],
  },
});

// research done → mark #1 complete, start #2
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
      return (
        toolName === "research" &&
        msgs.filter((m) => m.role === "tool").length === 2
      );
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
              status: "completed",
            },
            {
              id: "2",
              content: "Investigate quantum hardware developments",
              status: "in_progress",
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

// write_todos done → research hardware
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
      return (
        toolName === "write_todos" &&
        msgs.filter((m) => m.role === "tool").length === 3
      );
    },
  },
  response: {
    toolCalls: [
      {
        name: "research",
        arguments: JSON.stringify({ query: "quantum hardware developments" }),
      },
    ],
  },
});

// research done → mark #2 complete, start #3
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
      return (
        toolName === "research" &&
        msgs.filter((m) => m.role === "tool").length === 4
      );
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
              status: "completed",
            },
            {
              id: "2",
              content: "Investigate quantum hardware developments",
              status: "completed",
            },
            {
              id: "3",
              content: "Compile and write final report",
              status: "in_progress",
            },
          ],
        }),
      },
    ],
  },
});

// write_todos done → write final report
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
      return (
        toolName === "write_todos" &&
        msgs.filter((m) => m.role === "tool").length === 5
      );
    },
  },
  response: {
    toolCalls: [
      {
        name: "write_file",
        arguments: JSON.stringify({
          file_path: "/reports/final_report.md",
          content:
            "# Quantum Computing Report\n\nQuantum computing leverages qubits for exponential speedup.\n\n## Key Findings\n\n- Qubits enable superposition and entanglement\n- Key players: IBM (Eagle 127-qubit), Google Sycamore, IonQ\n\n## Conclusion\n\nQuantum computing will transform industries within the next decade.",
        }),
      },
    ],
  },
});

// write_file done → mark all complete
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
    toolCalls: [
      {
        name: "write_todos",
        arguments: JSON.stringify({
          todos: [
            {
              id: "1",
              content: "Research quantum computing basics",
              status: "completed",
            },
            {
              id: "2",
              content: "Investigate quantum hardware developments",
              status: "completed",
            },
            {
              id: "3",
              content: "Compile and write final report",
              status: "completed",
            },
          ],
        }),
      },
    ],
  },
});

// final write_todos done → final message
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
      return (
        toolName === "write_todos" &&
        msgs.filter((m) => m.role === "tool").length === 7
      );
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
