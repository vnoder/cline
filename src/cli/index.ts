import { Command } from "commander"
import chalk from "chalk"
import inquirer from "inquirer"
import ora from "ora"
import * as path from "path"
import * as fs from "fs/promises"
import { CliController } from "./CliController"
import { CliContext } from "./CliContext"
import { InteractiveChat } from "./ui/InteractiveChat"
import { ApiConfiguration } from "@shared/api"

const program = new Command()

program
	.name("cline")
	.description("Cline - AI coding assistant for the command line")
	.version("3.17.12")

program
	.command("chat")
	.description("Start an interactive chat session")
	.option("-d, --directory <path>", "Working directory", process.cwd())
	.option("-c, --config <path>", "Path to configuration file")
	.option("--api-key <key>", "API key for the AI service")
	.option("--model <model>", "AI model to use")
	.option("--provider <provider>", "AI provider (anthropic, openai, etc.)")
	.action(async (options) => {
		try {
			await startInteractiveChat(options)
		} catch (error) {
			console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`))
			process.exit(1)
		}
	})

program
	.command("task <description>")
	.description("Execute a single task")
	.option("-d, --directory <path>", "Working directory", process.cwd())
	.option("-c, --config <path>", "Path to configuration file")
	.option("--api-key <key>", "API key for the AI service")
	.option("--model <model>", "AI model to use")
	.option("--provider <provider>", "AI provider (anthropic, openai, etc.)")
	.option("--auto-approve", "Automatically approve all actions")
	.action(async (description, options) => {
		try {
			await executeTask(description, options)
		} catch (error) {
			console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`))
			process.exit(1)
		}
	})

program
	.command("config")
	.description("Configure Cline settings")
	.option("-g, --global", "Configure global settings")
	.action(async (options) => {
		try {
			await configureSettings(options)
		} catch (error) {
			console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`))
			process.exit(1)
		}
	})

async function startInteractiveChat(options: any) {
	console.log(chalk.blue("🤖 Starting Cline interactive chat..."))
	
	const workingDir = path.resolve(options.directory)
	const context = new CliContext(workingDir)
	
	// Load or create configuration
	const apiConfig = await loadApiConfiguration(options, context)
	if (!apiConfig) {
		console.log(chalk.yellow("No API configuration found. Please configure Cline first."))
		await configureSettings({ global: false })
		return
	}
	
	const controller = new CliController(context, apiConfig)
	const chat = new InteractiveChat(controller)
	
	console.log(chalk.green(`Working directory: ${workingDir}`))
	console.log(chalk.green(`Using model: ${apiConfig.apiModelId || 'default'}`))
	console.log(chalk.gray("Type 'exit' or 'quit' to end the session\n"))
	
	await chat.start()
}

async function executeTask(description: string, options: any) {
	console.log(chalk.blue(`🤖 Executing task: ${description}`))
	
	const workingDir = path.resolve(options.directory)
	const context = new CliContext(workingDir)
	
	// Load or create configuration
	const apiConfig = await loadApiConfiguration(options, context)
	if (!apiConfig) {
		console.log(chalk.yellow("No API configuration found. Please configure Cline first."))
		await configureSettings({ global: false })
		return
	}
	
	const controller = new CliController(context, apiConfig, {
		autoApprove: options.autoApprove || false
	})
	
	try {
		await controller.executeTask(description)
		console.log(chalk.green("✅ Task completed successfully!"))
	} catch (error) {
		console.error(chalk.red("❌ Task failed"))
		throw error
	}
}

async function loadApiConfiguration(options: any, context: CliContext): Promise<ApiConfiguration | null> {
	// Priority: command line options > config file > stored config
	
	if (options.apiKey && options.provider) {
		return {
			apiProvider: options.provider,
			apiKey: options.apiKey,
			apiModelId: options.model,
		} as ApiConfiguration
	}
	
	if (options.config) {
		try {
			const configContent = await fs.readFile(options.config, 'utf-8')
			return JSON.parse(configContent)
		} catch (error) {
			console.warn(chalk.yellow(`Could not load config file: ${options.config}`))
		}
	}
	
	// Try to load from stored configuration
	return await context.getApiConfiguration()
}

async function configureSettings(options: any) {
	console.log(chalk.blue("🔧 Configuring Cline settings..."))
	
	const questions = [
		{
			type: 'list',
			name: 'provider',
			message: 'Select AI provider:',
			choices: [
				{ name: 'Anthropic (Claude)', value: 'anthropic' },
				{ name: 'OpenAI', value: 'openai-native' },
				{ name: 'SiliconFlow', value: 'siliconflow' },
				{ name: 'OpenRouter', value: 'openrouter' },
				{ name: 'Google Gemini', value: 'gemini' },
				{ name: 'Ollama (Local)', value: 'ollama' },
			]
		},
		{
			type: 'input',
			name: 'apiKey',
			message: 'Enter your API key:',
			when: (answers) => answers.provider !== 'ollama',
			validate: (input) => input.trim() !== '' || 'API key is required'
		},
		{
			type: 'input',
			name: 'model',
			message: 'Enter model ID (optional):',
		}
	]
	
	const answers = await inquirer.prompt(questions)
	
	const apiConfig: ApiConfiguration = {
		apiProvider: answers.provider,
		apiKey: answers.apiKey,
		apiModelId: answers.model || getDefaultModel(answers.provider),
	} as ApiConfiguration
	
	const context = new CliContext(process.cwd())
	await context.saveApiConfiguration(apiConfig)
	
	console.log(chalk.green("✅ Configuration saved successfully!"))
}

function getDefaultModel(provider: string): string {
	const defaults: Record<string, string> = {
		'anthropic': 'claude-3-5-sonnet-20241022',
		'openai-native': 'gpt-4o',
		'siliconflow': 'Qwen/Qwen2.5-7B-Instruct',
		'openrouter': 'anthropic/claude-3.5-sonnet',
		'gemini': 'gemini-1.5-pro-latest',
		'ollama': 'llama3.2'
	}
	return defaults[provider] || ''
}

// Parse command line arguments
program.parse()

// If no command provided, show help
if (process.argv.length === 2) {
	program.help()
}
