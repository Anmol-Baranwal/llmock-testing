## Testing

The repo includes Playwright tests that run the full stack (Next.js + LangChain Deep Agents) while mocking all OpenAI calls via [llmock](https://llmock.copilotkit.dev/).

### 1. Start the Deep Agent backend (Python)

```bash
cd agent
uv venv && source .venv/bin/activate
uv pip install -e .
uv run python main.py
```

Or with pip:

```bash
cd agent
python -m venv .venv && source .venv/bin/activate
pip install -e .
python main.py
```

### 2. Start the Next.js frontend (Node.js)

```bash
npm install
npm run dev
```

---

### Environment

Make sure `.env` exists in both the repo root and `agent/`:

```env
OPENAI_API_KEY=mock-key          # calls go through llmock
OPENAI_BASE_URL=http://localhost:5555/v1
TAVILY_API_KEY=your-real-tavily-key
OPENAI_MODEL=gpt-5.2
SERVER_PORT=8123
```

### Running the tests

From the repo root:

```bash
npx playwright test
```

These tests prove:

- The Python Deep Agent and Next.js frontend both read `OPENAI_BASE_URL` and hit llmock on `localhost:5555`.
- MSW (which runs inside the Next.js process) cannot see or intercept the Python agent’s OpenAI calls, but llmock can - since it operates at the HTTP layer for any language.
