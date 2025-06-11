# Cline CLI - Command Line Interface

Cline CLI brings the power of AI-assisted coding directly to your terminal. Get instant help with coding tasks, generate code, and interact with AI models without leaving the command line.

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/cline/cline.git
cd cline

# Install dependencies
npm install

# Build the CLI version
npm run compile-cli

# Install globally
cd cli-package
npm install -g .
```

### First Time Setup

Configure your AI provider:

```bash
cline config
```

This will prompt you to select an AI provider and enter your API key.

## 📋 Commands

### `cline task <description>`

Execute a single AI task:

```bash
# Basic usage
cline task "Write a Python function to calculate factorial"

# With specific provider and model
cline task "Create a REST API in Node.js" --provider siliconflow --api-key YOUR_API_KEY --model "Qwen/Qwen2.5-7B-Instruct"

# Auto-approve all actions (use with caution)
cline task "Fix all TypeScript errors in this project" --auto-approve
```

### `cline chat`

Start an interactive chat session:

```bash
# Basic usage
cline chat

# With specific configuration
cline chat --provider anthropic --api-key YOUR_API_KEY --directory /path/to/project
```

### `cline config`

Configure API settings:

```bash
# Interactive configuration
cline config

# Global configuration
cline config --global
```

## 🔧 Options

### Global Options

- `-d, --directory <path>` - Set working directory (default: current directory)
- `-c, --config <path>` - Path to configuration file
- `--api-key <key>` - API key for the AI service
- `--model <model>` - AI model to use
- `--provider <provider>` - AI provider
- `--auto-approve` - Automatically approve all actions (task command only)

### Supported Providers

| Provider | Value | API Key Required | Default Model |
|----------|-------|------------------|---------------|
| Anthropic Claude | `anthropic` | Yes | `claude-3-5-sonnet-20241022` |
| OpenAI | `openai-native` | Yes | `gpt-4o` |
| SiliconFlow | `siliconflow` | Yes | `Qwen/Qwen2.5-7B-Instruct` |
| Ollama (Local) | `ollama` | No | `llama3.2` |

## 💡 Examples

### Code Generation

```bash
# Generate a Python class
cline task "Create a Python class for managing a todo list with add, remove, and list methods"

# Create a web component
cline task "Write a React component for a responsive navigation bar"

# Generate API endpoints
cline task "Create Express.js routes for a user management system with CRUD operations"
```

### Code Analysis and Debugging

```bash
# Analyze code in current directory
cline task "Review the code in this directory and suggest improvements"

# Debug specific issues
cline task "Help me fix the TypeScript compilation errors in this project"

# Code review
cline task "Analyze this Python script for potential security vulnerabilities"
```

### Interactive Development

```bash
# Start a coding session
cline chat --provider siliconflow --api-key YOUR_API_KEY

# Then in the chat:
# > "Help me build a simple web server"
# > "Add authentication to the API"
# > "Write unit tests for the user service"
```

### Working with Different Providers

```bash
# Using Anthropic Claude
cline task "Explain this algorithm" --provider anthropic --api-key sk-ant-xxx

# Using OpenAI
cline task "Generate documentation" --provider openai-native --api-key sk-xxx

# Using SiliconFlow
cline task "Code review this file" --provider siliconflow --api-key sk-xxx

# Using local Ollama
cline task "Explain this code" --provider ollama --model llama3.2
```

## ⚙️ Configuration

### Configuration File

Cline stores configuration in `~/.cline/global/api-config.json`:

```json
{
  "apiProvider": "siliconflow",
  "apiKey": "your-api-key",
  "apiModelId": "Qwen/Qwen2.5-7B-Instruct"
}
```

### Environment Variables

You can also use environment variables:

```bash
export CLINE_PROVIDER=siliconflow
export CLINE_API_KEY=your-api-key
export CLINE_MODEL=Qwen/Qwen2.5-7B-Instruct

cline task "Your task here"
```

### Project-Specific Configuration

Create a `.cline/config.json` file in your project root:

```json
{
  "apiProvider": "anthropic",
  "apiKey": "project-specific-key",
  "apiModelId": "claude-3-5-sonnet-20241022"
}
```

## 🔒 Security Notes

- API keys are stored locally in `~/.cline/global/`
- Never commit API keys to version control
- Use `--auto-approve` with caution as it bypasses safety confirmations
- Review generated code before executing, especially for system operations

## 🐛 Troubleshooting

### Common Issues

**"Cannot find module 'vscode'"**
- This error indicates you're trying to run the VSCode extension version instead of CLI
- Make sure you're using the CLI build: `npm run compile-cli`

**"API request failed: 401 Unauthorized"**
- Check your API key is correct
- Verify the API key has sufficient permissions
- Ensure you're using the right provider

**"No API configuration found"**
- Run `cline config` to set up your API provider
- Or use command line options: `--provider` and `--api-key`

### Getting Help

```bash
# Show help for all commands
cline --help

# Show help for specific command
cline task --help
cline chat --help
cline config --help
```

## 🔄 Updating

To update Cline CLI:

```bash
cd /path/to/cline
git pull origin main
npm install
npm run compile-cli
cd cli-package
npm install -g .
```

## 🤝 Contributing

The CLI version is part of the main Cline project. See the main [Contributing Guide](CONTRIBUTING.md) for details on how to contribute.

## 📄 License

[Apache 2.0 © 2025 Cline Bot Inc.](./LICENSE)
