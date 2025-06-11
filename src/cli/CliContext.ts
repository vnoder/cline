import * as fs from "fs/promises"
import * as path from "path"
import * as os from "os"
import { ApiConfiguration } from "@shared/api"

/**
 * CLI context that mimics VSCode's ExtensionContext for command-line usage
 */
export class CliContext {
	private _workspaceFolder: string
	private _globalStoragePath: string
	private _workspaceStoragePath: string
	private _secretStorage: Map<string, string> = new Map()
	private _globalState: Map<string, any> = new Map()
	private _workspaceState: Map<string, any> = new Map()

	constructor(workspaceFolder: string) {
		this._workspaceFolder = workspaceFolder
		this._globalStoragePath = path.join(os.homedir(), '.cline', 'global')
		this._workspaceStoragePath = path.join(workspaceFolder, '.cline')
		
		this.ensureDirectories()
		this.loadState()
	}

	private async ensureDirectories() {
		try {
			await fs.mkdir(this._globalStoragePath, { recursive: true })
			await fs.mkdir(this._workspaceStoragePath, { recursive: true })
		} catch (error) {
			// Directory might already exist
		}
	}

	private async loadState() {
		try {
			// Load global state
			const globalStatePath = path.join(this._globalStoragePath, 'state.json')
			try {
				const globalStateContent = await fs.readFile(globalStatePath, 'utf-8')
				const globalState = JSON.parse(globalStateContent)
				this._globalState = new Map(Object.entries(globalState))
			} catch {
				// File doesn't exist or is invalid, start with empty state
			}

			// Load workspace state
			const workspaceStatePath = path.join(this._workspaceStoragePath, 'state.json')
			try {
				const workspaceStateContent = await fs.readFile(workspaceStatePath, 'utf-8')
				const workspaceState = JSON.parse(workspaceStateContent)
				this._workspaceState = new Map(Object.entries(workspaceState))
			} catch {
				// File doesn't exist or is invalid, start with empty state
			}

			// Load secrets
			const secretsPath = path.join(this._globalStoragePath, 'secrets.json')
			try {
				const secretsContent = await fs.readFile(secretsPath, 'utf-8')
				const secrets = JSON.parse(secretsContent)
				this._secretStorage = new Map(Object.entries(secrets))
			} catch {
				// File doesn't exist or is invalid, start with empty secrets
			}
		} catch (error) {
			console.warn('Failed to load state:', error)
		}
	}

	private async saveState() {
		try {
			// Save global state
			const globalStatePath = path.join(this._globalStoragePath, 'state.json')
			const globalStateObj = Object.fromEntries(this._globalState)
			await fs.writeFile(globalStatePath, JSON.stringify(globalStateObj, null, 2))

			// Save workspace state
			const workspaceStatePath = path.join(this._workspaceStoragePath, 'state.json')
			const workspaceStateObj = Object.fromEntries(this._workspaceState)
			await fs.writeFile(workspaceStatePath, JSON.stringify(workspaceStateObj, null, 2))

			// Save secrets
			const secretsPath = path.join(this._globalStoragePath, 'secrets.json')
			const secretsObj = Object.fromEntries(this._secretStorage)
			await fs.writeFile(secretsPath, JSON.stringify(secretsObj, null, 2))
		} catch (error) {
			console.warn('Failed to save state:', error)
		}
	}

	// Mimic VSCode ExtensionContext interface
	get globalStorageUri() {
		return { fsPath: this._globalStoragePath }
	}

	get workspaceState() {
		return {
			get: <T>(key: string): T | undefined => this._workspaceState.get(key),
			update: async (key: string, value: any) => {
				this._workspaceState.set(key, value)
				await this.saveState()
			}
		}
	}

	get globalState() {
		return {
			get: <T>(key: string): T | undefined => this._globalState.get(key),
			update: async (key: string, value: any) => {
				this._globalState.set(key, value)
				await this.saveState()
			}
		}
	}

	get secrets() {
		return {
			get: async (key: string): Promise<string | undefined> => this._secretStorage.get(key),
			store: async (key: string, value: string) => {
				this._secretStorage.set(key, value)
				await this.saveState()
			},
			delete: async (key: string) => {
				this._secretStorage.delete(key)
				await this.saveState()
			}
		}
	}

	// Extension-specific properties
	get extension() {
		return {
			packageJSON: {
				version: "3.17.12"
			}
		}
	}

	get subscriptions() {
		return []
	}

	// Workspace folder information
	get workspaceFolder() {
		return this._workspaceFolder
	}

	// API Configuration helpers
	async getApiConfiguration(): Promise<ApiConfiguration | null> {
		try {
			const configPath = path.join(this._globalStoragePath, 'api-config.json')
			const configContent = await fs.readFile(configPath, 'utf-8')
			return JSON.parse(configContent)
		} catch {
			return null
		}
	}

	async saveApiConfiguration(config: ApiConfiguration): Promise<void> {
		try {
			const configPath = path.join(this._globalStoragePath, 'api-config.json')
			await fs.writeFile(configPath, JSON.stringify(config, null, 2))
		} catch (error) {
			throw new Error(`Failed to save API configuration: ${error}`)
		}
	}

	// Task history helpers
	async getTaskHistory(): Promise<any[]> {
		try {
			const historyPath = path.join(this._globalStoragePath, 'task-history.json')
			const historyContent = await fs.readFile(historyPath, 'utf-8')
			return JSON.parse(historyContent)
		} catch {
			return []
		}
	}

	async saveTaskHistory(history: any[]): Promise<void> {
		try {
			const historyPath = path.join(this._globalStoragePath, 'task-history.json')
			await fs.writeFile(historyPath, JSON.stringify(history, null, 2))
		} catch (error) {
			console.warn('Failed to save task history:', error)
		}
	}

	// Cleanup
	async dispose() {
		await this.saveState()
	}
}
