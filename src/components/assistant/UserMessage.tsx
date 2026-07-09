import type { ChatMessage } from '../../lib/assistant/types'

export function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-tr-sm bg-[var(--navy)] px-4 py-2.5 text-sm leading-6 text-white shadow-[0_10px_28px_rgba(7,23,36,0.14)]">
        {message.text}
      </div>
    </div>
  )
}
