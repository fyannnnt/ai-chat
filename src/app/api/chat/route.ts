import { NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';

// 初始化Mistral客户端
const mistral = new Mistral({
	apiKey: process.env.MISTRAL_API_KEY ?? ''
});

// 错误处理函数
function handleError(error: any) {
	console.error('Chat API Error:', error);
	
	// API密钥相关错误
	if (error.response?.status === 401) {
		return {
			error: 'API密钥无效或未设置，请检查环境变量 MISTRAL_API_KEY',
			status: 401
		};
	}
	
	// 速率限制错误
	if (error.response?.status === 429) {
		return {
			error: '已达到API调用限制，请稍后再试',
			status: 429
		};
	}

	// 模型不可用
	if (error.response?.status === 404) {
		return {
			error: '请求的模型不可用或不存在',
			status: 404
		};
	}

	// 参数错误
	if (error.response?.status === 400) {
		return {
			error: '请求参数错误：' + (error.response?.data?.error?.message || '未知错误'),
			status: 400
		};
	}

	// 服务器错误
	if (error.response?.status >= 500) {
		return {
			error: 'Mistral API 服务器错误，请稍后重试',
			status: 500
		};
	}

	// 默认错误
	return {
		error: '发生未知错误：' + (error.message || '未知错误'),
		status: 500
	};
}

export async function POST(req: Request) {
	try {
		// 验证API密钥是否已设置
		if (!process.env.MISTRAL_API_KEY) {
			return NextResponse.json(
				{ error: '未设置 Mistral API 密钥，请在 .env.local 文件中设置 MISTRAL_API_KEY' },
				{ status: 401 }
			);
		}

		const { message, chatHistory } = await req.json();

		// 验证请求参数
		if (!message) {
			return NextResponse.json(
				{ error: '消息内容不能为空' },
				{ status: 400 }
			);
		}

		// 创建消息历史
		const messages = chatHistory ? [
			{ role: 'system', content: '你是一个有帮助的AI助手。请使用Markdown格式回复。' },
			...chatHistory,
			{ role: 'user', content: message }
		] : [
			{ role: 'system', content: '你是一个有帮助的AI助手。请使用Markdown格式回复。' },
			{ role: 'user', content: message }
		];

		console.log('Sending request with messages:', JSON.stringify(messages, null, 2));
		console.log('Using API key:', process.env.MISTRAL_API_KEY?.substring(0, 5) + '...');

		try {
			// 创建流式响应
			const stream = await mistral.chat.stream({
				model: 'mistral-small-latest',
				messages: messages,
				temperature: 0.7,
				max_tokens: 2000,
			});

			console.log('Stream created successfully');

			// 设置响应头
			const headers = {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive',
			};

			// 创建编码器
			const encoder = new TextEncoder();

			// 创建可读流
			const readableStream = new ReadableStream({
				async start(controller) {
					try {
						let hasReceivedContent = false;
						let isFirstChunk = true;
						let fullContent = '';
						
						for await (const chunk of stream) {
							console.log('完整的 chunk 结构:', chunk);
							console.log('chunk 类型:', typeof chunk);
							console.log('chunk 原型链:', Object.getPrototypeOf(chunk));
							
							// 安全地访问响应内容
							const content = chunk?.data?.choices?.[0]?.delta?.content;
							if (content) {
								hasReceivedContent = true;
								fullContent += content;
								
								// 发送当前完整的内容，而不是单个块
								const data = { 
									content: fullContent,
									isMarkdown: true
								};
								controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
							}
						}

						// 如果没有收到任何内容，发送错误消息
						if (!hasReceivedContent) {
							console.log('No content received from the model');
							const errorData = {
								error: '模型未返回任何内容，请重试',
								isMarkdown: false
							};
							controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
						}
						
						controller.enqueue(encoder.encode('data: [DONE]\n\n'));
						controller.close();
					} catch (error: unknown) {
						console.error('Stream processing error:', error);
						const errorMessage = error instanceof Error ? error.message : '未知错误';
						const errorData = {
							error: '处理响应流时发生错误：' + errorMessage,
							isMarkdown: false
						};
						controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
						controller.enqueue(encoder.encode('data: [DONE]\n\n'));
						controller.close();
					}
				},
			});

			return new NextResponse(readableStream, { headers });
		} catch (error: any) {
			console.error('Error creating stream:', error);
			const { error: errorMessage, status } = handleError(error);
			return NextResponse.json({ error: errorMessage }, { status });
		}
	} catch (error: any) {
		console.error('Chat API Error:', error);
		const { error: errorMessage, status } = handleError(error);
		return NextResponse.json({ error: errorMessage }, { status });
	}
} 