# UIGen

AI-powered React component generator with live preview.

## Prerequisites

- Node.js 18+
- npm

## Setup

1. **Optional** Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your-api-key-here
```

The project will run without an API key. Rather than using a LLM to generate components, static code will be returned instead.

2. Install dependencies and initialize database

```bash
npm run setup
```

This command will:

- Install all dependencies
- Generate Prisma client
- Run database migrations

## Running the Application

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Sign up or continue as anonymous user
2. Describe the React component you want to create in the chat
3. View generated components in real-time preview
4. Switch to Code view to see and edit the generated files
5. Continue iterating with the AI to refine your components

## Features

- AI-powered component generation using Claude
- Live preview with hot reload
- Virtual file system (no files written to disk)
- Syntax highlighting and code editor
- Component persistence for registered users
- Export generated code

## Tech Stack

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma with SQLite
- Anthropic Claude AI
- Vercel AI SDK

## Controlling context

By using escape, double-tap escape, /compact, and /clear strategically, you can keep Claude focused and productive throughout your development workflow.

## Custom commands

Find the .claude folder in your project directory
Create a new directory called commands inside it
Create a new markdown file with your desired command name (like  write_tests.md)

For example, a write_tests.md command might contain:

Write comprehensive tests for: $ARGUMENTS

Testing conventions:
* Use Vitests with React Testing Library
* Place test files in a __tests__ directory in the same folder as the source file
* Name test files as [filename].test.ts(x)
* Use @/ prefix for imports

Coverage:
* Test happy paths
* Test edge cases
* Test error states

restart claude code to pick up the new command:

You can then run this command with a file path:

/write_tests the use-auth.ts file in the hooks directory

## MCP servers with Claude Code

claude mcp add playwright npx @playwright/mcp@latest

allow permissions with

.claude/settings.local.json

{
    "permissions": {
        "allow": ["mcp__playwright"],
        "deny": []
    }
}

Navigate to localhost:3000, generate a basic component, review the styling, and update the generation prompt at @src/lib/prompts/generation.tsx to produce better components going forward.

## Github integration

1. Install (gh) -> brew install gh
2. Authenticate gh auth login -> gh auth login
3. Run cluade on the console and run /install-github-app
4. Create PR and pull that changes to your local branch

## Introducing hooks

PreToolUse hooks - Run before a tool is called
PostToolUse hooks - Run after a tool is called

Global - ~/.claude/settings.json (affects all projects)
Project - .claude/settings.json (shared with team)
Project (not committed) - .claude/settings.local.json (personal settings)


