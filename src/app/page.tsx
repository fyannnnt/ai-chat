'use client'

import { useState } from 'react'
import ChatInterface from '@/components/ChatInterface'
import Sidebar from '@/components/Sidebar'

export default function Home() {
  const [currentChatId, setCurrentChatId] = useState('1')

  const handleNewChat = () => {
    // TODO: 实现新建聊天功能
    console.log('New chat')
  }

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id)
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-shrink-0">
        <Sidebar onNewChat={handleNewChat} onSelectChat={handleSelectChat} />
      </div>
      <div className="flex-1 relative">
        <ChatInterface chatId={currentChatId} />
      </div>
    </div>
  )
}
