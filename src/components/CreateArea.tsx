import { useState, type SubmitEvent } from "react";

interface CreateAreaProps {
  onAdd: (note: { title: string; content: string }) => Promise<boolean>;
  disabled?: boolean;
}

export default function CreateArea({ onAdd, disabled = false }: CreateAreaProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submitNote(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled || saving || (!title.trim() && !content.trim())) return;

    setSaving(true);
    try {
      if (await onAdd({ title: title.trim(), content: content.trim() })) {
        setTitle("");
        setContent("");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submitNote}
      onFocus={() => setIsFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsFocused(false);
        }
      }}
      className="bg-white rounded-lg shadow-md p-4 m-4 mx-auto max-w-md flex flex-col gap-3"
    >
      {isFocused && (
        <input
          name="title"
          disabled={saving}
          aria-label="Note title"
          placeholder="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="font-semibold text-lg p-2"
        />
      )}
      <textarea
        name="content"
        disabled={saving}
        aria-label="Note content"
        placeholder="Take a note..."
        rows={isFocused ? 3 : 1}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        className="p-2 resize-none"
      />
      {isFocused && (
        <button
          type="submit"
          disabled={disabled || saving || (!title.trim() && !content.trim())}
          className="self-end bg-yellow-300 hover:bg-yellow-400 rounded-md px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Add note"}
        </button>
      )}
    </form>
  );
}
