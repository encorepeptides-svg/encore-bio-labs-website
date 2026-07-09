import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowUp, Sparkles, X } from 'lucide-react'
import { useAssistant } from './assistantContext'
import { AssistantMessage } from './AssistantMessage'
import { UserMessage } from './UserMessage'
import { TypingIndicator } from './TypingIndicator'
import { QuickActions } from './QuickActions'

export function EncoreAssistantPanel({ onClose }: { onClose: () => void }) {
  const { messages, isTyping, escalation, sendUserMessage, handleAction, handleQuickReply } = useAssistant()
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleFocusTrap(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab' || !panelRef.current) return
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled])',
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!draft.trim()) return
    void sendUserMessage(draft)
    setDraft('')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Encore AI Assistant"
      onKeyDown={handleFocusTrap}
      className="fixed inset-0 z-[80] flex items-end justify-end sm:inset-auto sm:bottom-6 sm:right-6"
    >
      <button
        type="button"
        aria-label="Close assistant"
        onClick={onClose}
        className="absolute inset-0 bg-[#071724]/24 backdrop-blur-sm sm:hidden"
      />

      <div
        ref={panelRef}
        className="relative flex h-full w-full flex-col overflow-hidden border border-white/60 bg-white/85 shadow-[0_40px_120px_rgba(7,23,36,0.28)] backdrop-blur-2xl sm:h-[38rem] sm:w-[24rem] sm:rounded-[1.75rem]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-900/8 bg-white/70 px-5 py-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-[0_10px_26px_rgba(46,196,165,0.4)]"
            >
              <Sparkles size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--navy)]">Encore AI Assistant</p>
              <p className="text-xs text-[var(--muted)]">Usually replies in a few seconds</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close assistant"
            className="flex size-9 items-center justify-center rounded-full border border-slate-900/8 bg-white text-[var(--navy)] transition hover:bg-slate-100"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
          {messages.map((message) =>
            message.role === 'assistant' ? (
              <AssistantMessage key={message.id} message={message} onQuickReply={handleQuickReply} />
            ) : (
              <UserMessage key={message.id} message={message} />
            ),
          )}
          {isTyping && <TypingIndicator />}
        </div>

        {!escalation && <QuickActions onAction={(id) => void handleAction(id)} />}

        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-900/8 bg-white/80 p-3">
          <label htmlFor="encore-assistant-input" className="sr-only">
            Message Encore AI Assistant
          </label>
          <input
            id="encore-assistant-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask about products, pricing, shipping..."
            autoComplete="off"
            className="h-11 flex-1 rounded-full border border-slate-900/8 bg-white px-4 text-sm text-[var(--navy)] outline-none transition placeholder:text-slate-400 focus:border-teal-500/70 focus:ring-4 focus:ring-teal-100"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!draft.trim()}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-white transition hover:bg-[var(--navy-deep)] disabled:opacity-40"
          >
            <ArrowUp size={18} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  )
}
