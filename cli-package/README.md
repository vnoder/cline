# Cline CLI

Cline is an AI coding assistant that can help you with various programming tasks directly from the command line.

## Installation

```bash
npm install -g cline-cli
```

## Usage

### Interactive Chat Mode
Start an interactive chat session with Cline:

```bash
cline chat
```

### Single Task Mode
Execute a single task:

```bash
cline task "Create a simple HTTP server in Node.js"
```

### Configuration
Configure your API settings:

```bash
cline config
```

## Options

- `-d, --directory <path>`: Set working directory
- `--api-key <key>`: Specify API key
- `--model <model>`: Choose AI model
- `--provider <provider>`: Select AI provider
- `--auto-approve`: Automatically approve all actions (use with caution)

## Examples

```bash
# Start chat in a specific directory
cline chat -d /path/to/project

# Execute a task with auto-approval
cline task "Fix all TypeScript errors" --auto-approve

# Use a specific model
cline chat --model claude-3-5-sonnet-20241022 --provider anthropic

# Use SiliconFlow
cline task "Write a Python function" --provider siliconflow --api-key YOUR_API_KEY
```

## Supported AI Providers

- Anthropic (Claude)
- OpenAI
- SiliconFlow
- OpenRouter
- Google Gemini
- Ollama (Local)

## License

Apache-2.0
