"use client";

import { useActionState } from "react";
import type { MessageActionState } from "@/lib/actions/message-actions";

type ThreadMessage = { id: string; sender: "GUEST" | "ADMIN"; body: string; createdAt: Date };
type Action = (state: MessageActionState, formData: FormData) => Promise<MessageActionState>;

export function MessageThread({
  messages,
  viewerRole,
  action,
  placeholder = "Write a message…",
}: {
  messages: ThreadMessage[];
  viewerRole: "GUEST" | "ADMIN";
  action: Action;
  placeholder?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <div>
      <div className="max-h-[360px] space-y-3 overflow-y-auto rounded-lg border border-hairline-soft bg-surface-soft/40 p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted">No messages yet.</p>
        ) : (
          messages.map((message) => {
            const isViewer = message.sender === viewerRole;
            return (
              <div key={message.id} className={`flex ${isViewer ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    isViewer ? "bg-ink text-canvas" : "border border-hairline-soft bg-canvas text-ink"
                  }`}
                >
                  <p className="whitespace-pre-line">{message.body}</p>
                  <p className={`mt-1 text-[10px] ${isViewer ? "text-canvas/70" : "text-muted"}`}>
                    {formatMessageTimestamp(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form action={formAction} className="mt-3 flex items-end gap-2">
        <textarea
          name="body"
          rows={2}
          required
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-hairline px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition-transform duration-150 hover:bg-primary-active active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send"}
        </button>
      </form>
      {state?.error ? <p className="mt-2 text-sm text-primary-error-text">{state.error}</p> : null}
    </div>
  );
}

function formatMessageTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
