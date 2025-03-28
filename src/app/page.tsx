import ChatInterface from '@/components/ChatInterface'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900">
      <div className="w-full max-w-4xl p-4">
        <h1 className="text-3xl font-bold text-center text-white mb-8">AI Chat</h1>
        <ChatInterface />
      </div>
    </main>
  )
}
