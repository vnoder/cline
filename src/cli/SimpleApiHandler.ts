import { ApiConfiguration } from "@shared/api"

export interface SimpleApiHandler {
	createMessage(systemPrompt: string, userMessage: string): AsyncGenerator<{ type: string; text: string }>
	getModel(): { id: string }
}

export class AnthropicSimpleHandler implements SimpleApiHandler {
	private apiKey: string
	private modelId: string

	constructor(config: ApiConfiguration) {
		this.apiKey = config.apiKey || ""
		this.modelId = config.apiModelId || "claude-3-5-sonnet-20241022"
	}

	async *createMessage(systemPrompt: string, userMessage: string): AsyncGenerator<{ type: string; text: string }> {
		try {
			const response = await fetch("https://api.anthropic.com/v1/messages", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": this.apiKey,
					"anthropic-version": "2023-06-01",
				},
				body: JSON.stringify({
					model: this.modelId,
					max_tokens: 4096,
					system: systemPrompt,
					messages: [
						{
							role: "user",
							content: userMessage,
						},
					],
					stream: true,
				}),
			})

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status} ${response.statusText}`)
			}

			const reader = response.body?.getReader()
			if (!reader) {
				throw new Error("No response body")
			}

			const decoder = new TextDecoder()
			let buffer = ""

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				buffer += decoder.decode(value, { stream: true })
				const lines = buffer.split("\n")
				buffer = lines.pop() || ""

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = line.slice(6)
						if (data === "[DONE]") {
							return
						}

						try {
							const parsed = JSON.parse(data)
							if (parsed.type === "content_block_delta" && parsed.delta?.text) {
								yield { type: "text", text: parsed.delta.text }
							}
						} catch (e) {
							// Ignore parsing errors
						}
					}
				}
			}
		} catch (error) {
			yield { type: "error", text: `Error: ${error}` }
		}
	}

	getModel(): { id: string } {
		return { id: this.modelId }
	}
}

export class OpenAISimpleHandler implements SimpleApiHandler {
	private apiKey: string
	private modelId: string

	constructor(config: ApiConfiguration) {
		this.apiKey = config.openAiNativeApiKey || ""
		this.modelId = config.apiModelId || "gpt-4o"
	}

	async *createMessage(systemPrompt: string, userMessage: string): AsyncGenerator<{ type: string; text: string }> {
		try {
			const response = await fetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${this.apiKey}`,
				},
				body: JSON.stringify({
					model: this.modelId,
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: userMessage },
					],
					stream: true,
				}),
			})

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status} ${response.statusText}`)
			}

			const reader = response.body?.getReader()
			if (!reader) {
				throw new Error("No response body")
			}

			const decoder = new TextDecoder()
			let buffer = ""

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				buffer += decoder.decode(value, { stream: true })
				const lines = buffer.split("\n")
				buffer = lines.pop() || ""

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = line.slice(6)
						if (data === "[DONE]") {
							return
						}

						try {
							const parsed = JSON.parse(data)
							if (parsed.choices?.[0]?.delta?.content) {
								yield { type: "text", text: parsed.choices[0].delta.content }
							}
						} catch (e) {
							// Ignore parsing errors
						}
					}
				}
			}
		} catch (error) {
			yield { type: "error", text: `Error: ${error}` }
		}
	}

	getModel(): { id: string } {
		return { id: this.modelId }
	}
}

export class SiliconFlowSimpleHandler implements SimpleApiHandler {
	private apiKey: string
	private modelId: string

	constructor(config: ApiConfiguration) {
		this.apiKey = config.apiKey || ""
		this.modelId = config.apiModelId || "Qwen/Qwen2.5-7B-Instruct"
	}

	async *createMessage(systemPrompt: string, userMessage: string): AsyncGenerator<{ type: string; text: string }> {
		try {
			const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${this.apiKey}`,
				},
				body: JSON.stringify({
					model: this.modelId,
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: userMessage },
					],
					stream: true,
				}),
			})

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status} ${response.statusText}`)
			}

			const reader = response.body?.getReader()
			if (!reader) {
				throw new Error("No response body")
			}

			const decoder = new TextDecoder()
			let buffer = ""

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				buffer += decoder.decode(value, { stream: true })
				const lines = buffer.split("\n")
				buffer = lines.pop() || ""

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = line.slice(6)
						if (data === "[DONE]") {
							return
						}

						try {
							const parsed = JSON.parse(data)
							if (parsed.choices?.[0]?.delta?.content) {
								yield { type: "text", text: parsed.choices[0].delta.content }
							}
						} catch (e) {
							// Ignore parsing errors
						}
					}
				}
			}
		} catch (error) {
			yield { type: "error", text: `Error: ${error}` }
		}
	}

	getModel(): { id: string } {
		return { id: this.modelId }
	}
}

export class OllamaSimpleHandler implements SimpleApiHandler {
	private baseUrl: string
	private modelId: string

	constructor(config: ApiConfiguration) {
		this.baseUrl = config.ollamaBaseUrl || "http://localhost:11434"
		this.modelId = config.apiModelId || "llama3.2"
	}

	async *createMessage(systemPrompt: string, userMessage: string): AsyncGenerator<{ type: string; text: string }> {
		try {
			const response = await fetch(`${this.baseUrl}/api/chat`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: this.modelId,
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: userMessage },
					],
					stream: true,
				}),
			})

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status} ${response.statusText}`)
			}

			const reader = response.body?.getReader()
			if (!reader) {
				throw new Error("No response body")
			}

			const decoder = new TextDecoder()
			let buffer = ""

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				buffer += decoder.decode(value, { stream: true })
				const lines = buffer.split("\n")
				buffer = lines.pop() || ""

				for (const line of lines) {
					if (line.trim()) {
						try {
							const parsed = JSON.parse(line)
							if (parsed.message?.content) {
								yield { type: "text", text: parsed.message.content }
							}
							if (parsed.done) {
								return
							}
						} catch (e) {
							// Ignore parsing errors
						}
					}
				}
			}
		} catch (error) {
			yield { type: "error", text: `Error: ${error}` }
		}
	}

	getModel(): { id: string } {
		return { id: this.modelId }
	}
}

export function buildSimpleApiHandler(config: ApiConfiguration): SimpleApiHandler {
	switch (config.apiProvider) {
		case "anthropic":
			return new AnthropicSimpleHandler(config)
		case "openai-native":
			return new OpenAISimpleHandler(config)
		case "siliconflow":
			return new SiliconFlowSimpleHandler(config)
		case "ollama":
			return new OllamaSimpleHandler(config)
		default:
			// Default to a mock handler for unsupported providers
			return new MockSimpleHandler(config)
	}
}

class MockSimpleHandler implements SimpleApiHandler {
	private config: ApiConfiguration

	constructor(config: ApiConfiguration) {
		this.config = config
	}

	async *createMessage(systemPrompt: string, userMessage: string): AsyncGenerator<{ type: string; text: string }> {
		yield {
			type: "text",
			text: `This is a mock response for provider "${this.config.apiProvider}". 

Your request: "${userMessage}"

To use the full Cline experience with real AI responses, please:
1. Configure a supported provider (anthropic, openai-native, or ollama)
2. Provide valid API credentials
3. Or use the VSCode extension version for full functionality

Supported providers in CLI:
- anthropic: Requires API key
- openai-native: Requires API key  
- ollama: Requires local Ollama server running

Current provider: ${this.config.apiProvider || "none"}`,
		}
	}

	getModel(): { id: string } {
		return { id: this.config.apiModelId || "mock-model" }
	}
}
