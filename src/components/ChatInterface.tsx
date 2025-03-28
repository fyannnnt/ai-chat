'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
	role: 'user' | 'assistant' | 'system';
	content: string;
	isMarkdown?: boolean;
}

interface ChatInterfaceProps {
	chatId: string;
}

export default function ChatInterface({ chatId }: ChatInterfaceProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleExampleClick = (example: string) => {
		setInput(example.replace(/[""]/g, ''));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;

		const userMessage: Message = {
			role: 'user',
			content: input.trim()
		};

		setMessages(prev => [...prev, userMessage]);
		setInput('');
		setIsLoading(true);

		try {
			const chatHistory = messages
				.filter(msg => msg.role !== 'system')
				.map(msg => ({
					role: msg.role,
					content: msg.content
				}));

			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: userMessage.content,
					chatHistory: chatHistory
				})
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			let assistantMessage = {
				role: 'assistant' as const,
				content: '',
				isMarkdown: true
			};

			let isFirstChunk = true;

			while (true) {
				const { done, value } = await reader!.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split('\n');

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const data = line.slice(6);
						if (data === '[DONE]') {
							break;
						}
						try {
							const parsed = JSON.parse(data);
							if (parsed.error) {
								setMessages(prev => [
									...prev,
									{
										role: 'assistant' as const,
										content: parsed.error,
										isMarkdown: false
									}
								]);
								break;
							}
							if (isFirstChunk) {
								setIsLoading(false);
								isFirstChunk = false;
								setMessages(prev => [...prev, assistantMessage]);
							}
							assistantMessage = {
								role: 'assistant',
								content: parsed.content,
								isMarkdown: parsed.isMarkdown
							};
							setMessages(prev => [...prev.slice(0, -1), assistantMessage]);
						} catch (e) {
							console.error('Error parsing SSE data:', e);
						}
					}
				}
			}
		} catch (error) {
			console.error('Error:', error);
			setMessages(prev => [
				...prev,
				{
					role: 'assistant',
					content: '抱歉，发生了一些错误。请稍后重试。'
				}
			]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='flex flex-col h-screen ml-[260px] bg-white'>
			{messages.length === 0 ? (
				<div className='flex-1 flex items-center justify-center p-4'>
					<div className='max-w-2xl w-full'>
						<div className='text-center mb-8'>
							<h1 className='text-2xl font-bold text-gray-800 mb-2'>
								欢迎使用 AI 助手
							</h1>
							<p className='text-gray-600 text-sm'>
								开始对话，探索无限可能
							</p>
						</div>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
								<h2 className='text-gray-800 font-medium mb-2'>
									示例
								</h2>
								<ul className='space-y-2'>
									<li
										onClick={() =>
											handleExampleClick(
												'"解释量子计算的基本原理"'
											)
										}
										className='text-sm text-gray-600 cursor-pointer hover:text-emerald-600 transition-colors hover:bg-emerald-50 p-2 rounded-md'
									>
										"解释量子计算的基本原理"
									</li>
									<li
										onClick={() =>
											handleExampleClick(
												'"帮我写一个快速排序算法"'
											)
										}
										className='text-sm text-gray-600 cursor-pointer hover:text-emerald-600 transition-colors hover:bg-emerald-50 p-2 rounded-md'
									>
										"帮我写一个快速排序算法"
									</li>
									<li
										onClick={() =>
											handleExampleClick(
												'"如何使用 React 和 TypeScript"'
											)
										}
										className='text-sm text-gray-600 cursor-pointer hover:text-emerald-600 transition-colors hover:bg-emerald-50 p-2 rounded-md'
									>
										"如何使用 React 和 TypeScript"
									</li>
								</ul>
							</div>
							<div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
								<h2 className='text-gray-800 font-medium mb-2'>
									能力
								</h2>
								<ul className='space-y-2'>
									<li className='text-sm text-gray-600'>
										<span className='block'>
											记住对话上下文
										</span>
									</li>
									<li className='text-sm text-gray-600'>
										<span className='block'>
											生成代码和解释
										</span>
									</li>
									<li className='text-sm text-gray-600'>
										<span className='block'>
											回答问题和提供建议
										</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className='flex-1 overflow-y-auto'>
					{messages.map((message, index) => (
						<div
							key={index}
							className={`border-b border-gray-100 ${
								message.role === 'assistant'
									? 'bg-gray-50'
									: 'bg-white'
							}`}
						>
							<div className='max-w-3xl mx-auto py-6 px-4'>
								<div className='flex items-start space-x-4'>
									{message.role === 'assistant' && (
										<div className='w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0'>
											<span className='text-sm font-bold text-white'>
												AI
											</span>
										</div>
									)}
									<div className='flex-1 overflow-hidden'>
										<div className='prose max-w-none'>
											{message.isMarkdown ? (
												<ReactMarkdown>{message.content}</ReactMarkdown>
											) : (
												message.content
											)}
										</div>
									</div>
									{message.role === 'user' && (
										<div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0'>
											<span className='text-sm font-bold text-gray-600'>
												你
											</span>
										</div>
									)}
								</div>
							</div>
						</div>
					))}
					{isLoading && (
						<div className='border-b border-gray-100 bg-gray-50'>
							<div className='max-w-3xl mx-auto py-6 px-4'>
								<div className='flex items-start space-x-4'>
									<div className='w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0'>
										<span className='text-sm font-bold text-white'>
											AI
										</span>
									</div>
									<div className='flex space-x-2'>
										<div className='w-2 h-2 bg-emerald-500 rounded-full animate-bounce' />
										<div className='w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100' />
										<div className='w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200' />
									</div>
								</div>
							</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>
			)}
			<div className='border-t border-gray-200 bg-white p-4'>
				<div className='max-w-3xl mx-auto'>
					<form onSubmit={handleSubmit} className='relative'>
						<input
							type='text'
							value={input}
							onChange={e => setInput(e.target.value)}
							placeholder='输入消息...'
							className='w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 pr-24 focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-gray-200'
							disabled={isLoading}
						/>
						<button
							type='submit'
							disabled={isLoading || !input.trim()}
							className='absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
						>
							发送
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}