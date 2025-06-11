import { EventEmitter } from "events"
import chalk from "chalk"
import ora, { Ora } from "ora"
import { CliContext } from "./CliContext"
import { ApiConfiguration } from "@shared/api"
import { HistoryItem } from "@shared/HistoryItem"
import { buildSimpleApiHandler, SimpleApiHandler } from "./SimpleApiHandler"

export interface CliOptions {
	autoApprove?: boolean
	verbose?: boolean
}

/**
 * CLI Controller that manages task execution and user interaction
 */
export class CliController extends EventEmitter {
	private context: CliContext
	private apiConfiguration: ApiConfiguration
	private options: CliOptions
	private apiHandler: SimpleApiHandler
	private spinner?: Ora

	constructor(context: CliContext, apiConfiguration: ApiConfiguration, options: CliOptions = {}) {
		super()
		this.context = context
		this.apiConfiguration = apiConfiguration
		this.options = options
		this.apiHandler = buildSimpleApiHandler(apiConfiguration)
	}

	async executeTask(description: string): Promise<void> {
		console.log(chalk.blue(`\n🚀 Starting task: ${description}\n`))

		try {
			this.spinner = ora("Processing task...").start()

			// Create system prompt
			const systemPrompt = `You are Cline, an AI coding assistant. You help users with programming tasks, file operations, and code analysis.

Current working directory: ${this.context.workspaceFolder}

Please help the user with their request. Be concise and helpful. If you need to perform file operations or run commands, explain what you would do but note that this is a simplified CLI version.`

			// Call the API
			const stream = this.apiHandler.createMessage(systemPrompt, description)

			this.spinner.stop()
			console.log(chalk.green("🤖 Cline:"))

			// Stream the response
			let response = ""
			for await (const chunk of stream) {
				if (chunk.type === "text") {
					process.stdout.write(chunk.text)
					response += chunk.text
				} else if (chunk.type === "error") {
					console.error(chalk.red(chunk.text))
					response += chunk.text
				}
			}

			console.log("\n") // Add newline at the end

			// Save to history
			await this.saveToHistory(description, response)

			this.emit('completed')

		} catch (error) {
			if (this.spinner) {
				this.spinner.fail("Task failed")
			}
			console.error(chalk.red(`Task failed: ${error}`))
			throw error
		}
	}

	async sendMessage(message: string): Promise<void> {
		await this.executeTask(message)
	}

	private async saveToHistory(task: string, response: string): Promise<void> {
		try {
			const historyItem: HistoryItem = {
				id: Date.now().toString(),
				ts: Date.now(),
				task: task,
				tokensIn: 0,
				tokensOut: 0,
				cacheWrites: 0,
				cacheReads: 0,
				totalCost: 0,
				isFavorited: false
			}

			const history = await this.context.getTaskHistory()
			history.unshift(historyItem)
			await this.context.saveTaskHistory(history.slice(0, 100))
		} catch (error) {
			console.warn(chalk.yellow(`Warning: Could not save to history: ${error}`))
		}
	}

	async dispose(): Promise<void> {
		if (this.spinner) {
			this.spinner.stop()
		}
		await this.context.dispose()
	}
}
