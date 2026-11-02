import { useEffect, useRef, useState, type FormEvent } from "react";

interface ProjectFormProps {
  initialName?: string;
  submitLabel: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export function ProjectForm({ initialName = "", submitLabel, onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName) onSubmit(trimmedName);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="project-name">Project name</label>
        <input
          ref={inputRef}
          id="project-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
          placeholder="e.g. Client dashboard"
          autoComplete="off"
        />
      </div>
      <div className="modal__actions">
        <button className="button button--ghost" type="button" onClick={onCancel}>Cancel</button>
        <button className="button button--primary" type="submit" disabled={!name.trim()}>{submitLabel}</button>
      </div>
    </form>
  );
}
