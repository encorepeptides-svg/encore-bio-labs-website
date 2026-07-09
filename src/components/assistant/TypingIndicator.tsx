export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 pl-9" role="status" aria-live="polite">
      <span className="sr-only">Encore AI is typing</span>
      <span className="size-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:-0.3s]" aria-hidden="true" />
      <span className="size-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:-0.15s]" aria-hidden="true" />
      <span className="size-1.5 animate-bounce rounded-full bg-teal-500" aria-hidden="true" />
    </div>
  )
}
