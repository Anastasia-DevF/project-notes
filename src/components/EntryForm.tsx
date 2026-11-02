import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ProjectTab } from "../types";

export interface EntryFormValue {
  title: string;
  value: string;
}

interface EntryFormProps {
  kind: ProjectTab;
  initialValue?: EntryFormValue;
  submitLabel: string;
  onSubmit: (value: EntryFormValue) => void;
  onCancel: () => void;
}

const config = {
  notes: {
    titleLabel: "Title",
    titlePlaceholder: "What is this note about?",
    valueLabel: "Note",
    valuePlaceholder: "Write your note…",
  },
  commands: {
    titleLabel: "Command name",
    titlePlaceholder: "e.g. Start development server",
    valueLabel: "Command",
    valuePlaceholder: "npm run dev",
  },
  links: {
    titleLabel: "Link name",
    titlePlaceholder: "e.g. Project documentation",
    valueLabel: "URL",
    valuePlaceholder: "https://example.com",
  },
} satisfies Record<ProjectTab, Record<string, string>>;

export function EntryForm({ kind, initialValue, submitLabel, onSubmit, onCancel }: EntryFormProps) {
  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [value, setValue] = useState(initialValue?.value ?? "");
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const labels = config[kind];

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanValue = value.trim();

    if (!cleanTitle || !cleanValue) return;

    if (kind === "links") {
      const candidate = /^https?:\/\//i.test(cleanValue) ? cleanValue : `https://${cleanValue}`;
      try {
        const parsedUrl = new URL(candidate);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error();
        onSubmit({ title: cleanTitle, value: parsedUrl.toString() });
        return;
      } catch {
        setError("Enter a valid http or https URL.");
        return;
      }
    }

    onSubmit({ title: cleanTitle, value: cleanValue });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="entry-title">{labels.titleLabel}</label>
        <input
          ref={titleRef}
          id="entry-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          placeholder={labels.titlePlaceholder}
          autoComplete="off"
        />
      </div>
      <div className="form-field">
        <label htmlFor="entry-value">{labels.valueLabel}</label>
        {kind === "links" ? (
          <input
            id="entry-value"
            value={value}
            onChange={(event) => { setValue(event.target.value); setError(""); }}
            placeholder={labels.valuePlaceholder}
            inputMode="url"
            autoComplete="url"
          />
        ) : (
          <textarea
            id="entry-value"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={labels.valuePlaceholder}
            rows={kind === "notes" ? 9 : 5}
          />
        )}
        {error && <span className="form-error">{error}</span>}
      </div>
      <div className="modal__actions">
        <button className="button button--ghost" type="button" onClick={onCancel}>Cancel</button>
        <button className="button button--primary" type="submit" disabled={!title.trim() || !value.trim()}>{submitLabel}</button>
      </div>
    </form>
  );
}
