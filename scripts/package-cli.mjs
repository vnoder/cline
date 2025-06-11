import fs from "fs"
import path from "path"
import { cp } from "fs/promises"
import { execSync } from "child_process"

const BUILD_DIR = "dist-cli"
const CLI_PACKAGE_DIR = "cli-package"

// Create CLI package directory
if (fs.existsSync(CLI_PACKAGE_DIR)) {
	fs.rmSync(CLI_PACKAGE_DIR, { recursive: true })
}
fs.mkdirSync(CLI_PACKAGE_DIR, { recursive: true })

// Copy the built CLI file
fs.copyFileSync(path.join(BUILD_DIR, "cline.js"), path.join(CLI_PACKAGE_DIR, "cline.js"))

// Make the CLI file executable
try {
	execSync(`chmod +x ${path.join(CLI_PACKAGE_DIR, "cline.js")}`)
} catch (error) {
	console.warn("Could not make CLI file executable:", error.message)
}

// Create package.json for CLI
const cliPackageJson = {
	name: "cline-cli",
	version: "3.17.12",
	description: "Cline - AI coding assistant for the command line",
	main: "cline.js",
	bin: {
		cline: "./cline.js"
	},
	keywords: [
		"ai",
		"coding",
		"assistant",
		"cli",
		"claude",
		"anthropic"
	],
	author: "Cline Bot Inc.",
	license: "Apache-2.0",
	repository: {
		type: "git",
		url: "https://github.com/cline/cline"
	},
	homepage: "https://cline.bot",
	engines: {
		node: ">=18.0.0"
	}
}

fs.writeFileSync(
	path.join(CLI_PACKAGE_DIR, "package.json"),
	JSON.stringify(cliPackageJson, null, 2)
)

// Create README for CLI
const cliReadme = `# Cline CLI

Cline is an AI coding assistant that can help you with various programming tasks directly from the command line.

## Installation

\`\`\`bash
npm install -g cline-cli
\`\`\`

## Usage

### Interactive Chat Mode
Start an interactive chat session with Cline:

\`\`\`bash
cline chat
\`\`\`

### Single Task Mode
Execute a single task:

\`\`\`bash
cline task "Create a simple HTTP server in Node.js"
\`\`\`

### Configuration
Configure your API settings:

\`\`\`bash
cline config
\`\`\`

## Options

- \`-d, --directory <path>\`: Set working directory
- \`--api-key <key>\`: Specify API key
- \`--model <model>\`: Choose AI model
- \`--provider <provider>\`: Select AI provider
- \`--auto-approve\`: Automatically approve all actions (use with caution)

## Examples

\`\`\`bash
# Start chat in a specific directory
cline chat -d /path/to/project

# Execute a task with auto-approval
cline task "Fix all TypeScript errors" --auto-approve

# Use a specific model
cline chat --model claude-3-5-sonnet-20241022 --provider anthropic
\`\`\`

## Supported AI Providers

- Anthropic (Claude)
- OpenAI
- OpenRouter
- Google Gemini
- Ollama (Local)

## License

Apache-2.0
`

fs.writeFileSync(path.join(CLI_PACKAGE_DIR, "README.md"), cliReadme)

console.log(`✅ CLI package created in ${CLI_PACKAGE_DIR}/`)
console.log(`📦 To install globally: cd ${CLI_PACKAGE_DIR} && npm install -g .`)
console.log(`🚀 To test locally: cd ${CLI_PACKAGE_DIR} && node cline.js --help`)
