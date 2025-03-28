declare module '@mistralai/mistralai' {
	export class Mistral {
		constructor(config: { apiKey: string });
		
		chat: {
			complete(options: {
				model: string;
				messages: Array<{ role: string; content: string }>;
				temperature?: number;
				max_tokens?: number;
			}): Promise<{
				choices: Array<{
					message: {
						content: string;
					};
				}>;
			}>;

			stream(options: {
				model: string;
				messages: Array<{ role: string; content: string }>;
				temperature?: number;
				max_tokens?: number;
			}): AsyncIterable<{
				data: {
					choices: Array<{
						delta: {
							content?: string;
						};
					}>;
				};
			}>;
		};
	}
} 