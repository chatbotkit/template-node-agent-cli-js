# AI Agent CLI Template for Node.js / ChatBotKit

A standalone command-line AI agent template that uses the ChatBotKit Agent SDK to run bespoke agents with built-in tools for file manipulation, code editing, and shell command execution.

## Why ChatBotKit Agent SDK?

Instead of wiring up raw LLM API calls and building tool execution loops from scratch, this template uses `@chatbotkit/agent` which provides:

- **Agentic execution loop** - Automatic multi-iteration tool-calling with planning, progress tracking, and controlled exit
- **Built-in tools** - Read, write, edit files, and execute shell commands out of the box
- **Platform integration** - Optionally connect to ChatBotKit platform bots for managed capabilities

## Features

- **Custom tools** - Add domain-specific tools in `src/tools.js` using zod schemas
- **Built-in file tools** - Read, write, and edit files with line-range support
- **Shell execution** - Run non-interactive shell commands with timeout control
- **Streaming output** - Real-time token streaming in interactive terminals
- **JSON output** - Structured JSON output for piping and automation
- **Platform bots** - Optionally use a pre-configured ChatBotKit bot with all its platform capabilities

## Setup

### Prerequisites

- Node.js 20+
- A [ChatBotKit](https://chatbotkit.com) account and API token

### Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your CHATBOTKIT_API_SECRET

# Run the agent
node src/index.js "List all JavaScript files in the current directory"
```

## Usage

```bash
# Basic usage - pass a prompt as an argument
node src/index.js "Summarize the contents of README.md"

# Use a custom agent definition file
node src/index.js -a my-agent.md "Review the code in src/"

# Specify a model
node src/index.js -m claude-sonnet-4-20250514 "Explain this codebase"

# Use a ChatBotKit platform bot
node src/index.js -b bot_abc123 "Help me with my project"

# Disable built-in tools (only custom tools available)
node src/index.js --no-builtin-tools "What time is it?"

# Debug mode - print raw stream events
node src/index.js -d "Debug this issue"

# Pipe-friendly JSON output (non-TTY)
node src/index.js "List files" | jq .
```

### CLI Options

| Option                     | Description                          |
| -------------------------- | ------------------------------------ |
| `-a, --agent <path>`       | Path to an agent markdown file       |
| `-m, --model <model>`      | Model to use (default: `gpt-4o`)     |
| `-b, --bot <id>`           | Use a ChatBotKit bot by ID           |
| `-i, --max-iterations <n>` | Maximum iterations (default: 100)    |
| `--no-builtin-tools`       | Disable built-in file and exec tools |
| `-d, --debug`              | Print raw stream events to stderr    |

## Project Structure

```
template-node-agent-cli-js/
  src/
    index.js            # CLI entry point and agent execution loop
    tools.js            # Custom tool definitions (add your own here)
  .env.example          # Environment variable template
  package.json
```

## Customization

### Custom Tools

Add tools to `src/tools.js`. Each tool needs a `description`, a zod `input` schema, and a `handler`:

```js
import { z } from 'zod'

export const customTools = {
  fetchUrl: {
    description: 'Fetch the contents of a URL',
    input: z.object({
      url: z.string().url().describe('The URL to fetch'),
    }),
    handler: async (input) => {
      const response = await fetch(input.url)
      const text = await response.text()
      return { success: true, content: text.slice(0, 5000) }
    },
  },
}
```

## Environment Variables

| Variable                | Required | Description               |
| ----------------------- | -------- | ------------------------- |
| `CHATBOTKIT_API_SECRET` | Yes      | Your ChatBotKit API token |

## License

MIT - see [LICENSE](./LICENSE)
