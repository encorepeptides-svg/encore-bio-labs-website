import { Sparkles } from 'lucide-react'
import type { ChatMessage, QuickReply } from '../../lib/assistant/types'

export function AssistantMessage({
  message,
  onQuickReply,
}: {
  message: ChatMessage
  onQuickReply: (reply: QuickReply) => void
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-[0_6px_16px_rgba(46,196,165,0.35)]"
      >
        <Sparkles size={12} aria-hidden="true" />
      </span>
      <div className="max-w-[85%] space-y-2">
        <div className="whitespace-pre-line rounded-2xl rounded-tl-sm border border-slate-900/8 bg-white px-4 py-2.5 text-sm leading-6 text-[var(--navy)] shadow-[0_10px_28px_rgba(7,23,36,0.06)]">
          {message.text}
        </div>

        {message.cta && (
          <a
            href={message.cta.href}
            target={message.cta.external ? '_blank' : undefined}
            rel={message.cta.external ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(37,211,102,0.32)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#20bd5a]"
          >
            {message.cta.label}
          </a>
        )}

        {message.quickReplies && message.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.quickReplies.map((reply) => (
              <button
                key={reply.id}
                type="button"
                onClick={() => onQuickReply(reply)}
                className="rounded-full border border-teal-300/60 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 transition hover:-translate-y-0.5 hover:bg-teal-100"
              >
                {reply.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
