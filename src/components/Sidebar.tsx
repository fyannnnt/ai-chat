'use client';

import { useState } from 'react';

interface ChatHistory {
	id: string;
	title: string;
	active: boolean;
}

interface SidebarProps {
	onNewChat: () => void;
	onSelectChat: (id: string) => void;
}

export default function Sidebar({ onNewChat, onSelectChat }: SidebarProps) {
	const [chatHistory, setChatHistory] = useState<ChatHistory[]>([
		{
			id: '1',
			title: '新的对话',
			active: true
		}
	]);

	return (
		<div className='w-[260px] h-screen bg-gray-50 flex flex-col border-r border-gray-200 fixed left-0 top-0'>
			<div className='p-2'>
				<button
					onClick={onNewChat}
					className='w-full bg-emerald-500 text-white rounded-md p-3 hover:bg-emerald-600 transition-colors flex items-center space-x-2'
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='h-4 w-4'
						viewBox='0 0 20 20'
						fill='currentColor'
					>
						<path
							fillRule='evenodd'
							d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
							clipRule='evenodd'
						/>
					</svg>
					<span className='text-sm'>新对话</span>
				</button>
			</div>
			<div className='flex-1 overflow-y-auto'>
				{chatHistory.map(chat => (
					<div
						key={chat.id}
						onClick={() => onSelectChat(chat.id)}
						className={`px-2 py-3 cursor-pointer hover:bg-gray-100 transition-colors mx-2 rounded-md ${
							chat.active
								? 'bg-emerald-50 text-emerald-700'
								: 'text-gray-700'
						}`}
					>
						<div className='flex items-center space-x-3'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className={`h-4 w-4 ${
									chat.active
										? 'text-emerald-500'
										: 'text-gray-400'
								}`}
								viewBox='0 0 20 20'
								fill='currentColor'
							>
								<path
									fillRule='evenodd'
									d='M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z'
									clipRule='evenodd'
								/>
							</svg>
							<span className='text-sm truncate'>
								{chat.title}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
