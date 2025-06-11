import * as readline from "readline"
import chalk from "chalk"
import { CliController } from "../CliController"

/**
 * Interactive chat interface for CLI
 */
export class InteractiveChat {
	private controller: CliController
	private rl: readline.Interface
	private isWaitingForResponse = false

	constructor(controller: CliController) {
		this.controller = controller
		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: chalk.blue('You: ')
		})

		this.setupEventListeners()
	}

	private setupEventListeners(): void {
		// Handle controller events
		this.controller.on('completed', () => {
			this.isWaitingForResponse = false
			this.showPrompt()
		})

		this.controller.on('cancelled', () => {
			this.isWaitingForResponse = false
			this.showPrompt()
		})

		this.controller.on('error', (error) => {
			console.error(chalk.red(`Error: ${error}`))
			this.isWaitingForResponse = false
			this.showPrompt()
		})

		// Handle readline events
		this.rl.on('line', async (input) => {
			const trimmedInput = input.trim()
			
			if (this.isExitCommand(trimmedInput)) {
				await this.exit()
				return
			}

			if (this.isWaitingForResponse) {
				console.log(chalk.yellow("Please wait for the current response to complete..."))
				this.showPrompt()
				return
			}

			if (trimmedInput === '') {
				this.showPrompt()
				return
			}

			await this.handleUserInput(trimmedInput)
		})

		this.rl.on('SIGINT', async () => {
			console.log(chalk.yellow('\nReceived SIGINT. Exiting...'))
			await this.exit()
		})
	}

	private isExitCommand(input: string): boolean {
		const exitCommands = ['exit', 'quit', 'q', 'bye']
		return exitCommands.includes(input.toLowerCase())
	}

	private async handleUserInput(input: string): Promise<void> {
		try {
			this.isWaitingForResponse = true
			console.log() // Add blank line for better readability
			
			// Show thinking indicator
			console.log(chalk.gray("🤖 Cline is thinking..."))
			
			await this.controller.sendMessage(input)
			
		} catch (error) {
			console.error(chalk.red(`Error processing message: ${error}`))
			this.isWaitingForResponse = false
			this.showPrompt()
		}
	}

	private showPrompt(): void {
		if (!this.isWaitingForResponse) {
			this.rl.prompt()
		}
	}

	async start(): Promise<void> {
		console.log(chalk.green("💬 Interactive chat started!"))
		console.log(chalk.gray("You can ask Cline to help with coding tasks, file operations, and more."))
		console.log(chalk.gray("Commands: 'exit', 'quit', 'q', or 'bye' to end the session\n"))
		
		this.showPrompt()
		
		// Keep the process alive
		return new Promise((resolve) => {
			this.rl.on('close', resolve)
		})
	}

	private async exit(): Promise<void> {
		console.log(chalk.blue("\n👋 Thanks for using Cline! Goodbye!"))
		
		try {
			await this.controller.dispose()
		} catch (error) {
			console.warn(chalk.yellow(`Warning during cleanup: ${error}`))
		}
		
		this.rl.close()
		process.exit(0)
	}
}
