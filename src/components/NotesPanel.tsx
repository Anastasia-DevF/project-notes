import type { Note } from "../types";
import { EditIcon, NoteIcon, PlusIcon, TrashIcon } from "./Icons";
import { EmptyState } from "./EmptyState";

interface NotesPanelProps {
  notes: Note[];
  onAdd: () => void;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export function NotesPanel({ notes, onAdd, onEdit, onDelete }: NotesPanelProps) {
  if (notes.length === 0) {
    return (
      <EmptyState
        compact
        icon={<NoteIcon />}
        title="No notes yet"
        description="Keep decisions, setup details and useful context close at hand."
        action={<button className="button button--primary" type="button" onClick={onAdd}><PlusIcon /> Add note</button>}
      />
    );
  }

  return (
    <div className="notes-grid">
      {notes.map((note) => (
        <article className="note-card" key={note.id}>
          <div className="card__header">
            <h3>{note.title}</h3>
            <div className="card__actions">
              <button className="icon-button" type="button" onClick={() => onEdit(note)} title="Edit note" aria-label={`Edit ${note.title}`}><EditIcon /></button>
              <button className="icon-button icon-button--danger" type="button" onClick={() => onDelete(note)} title="Delete note" aria-label={`Delete ${note.title}`}><TrashIcon /></button>
            </div>
          </div>
          <p className="note-card__content">{note.content}</p>
        </article>
      ))}
    </div>
  );
}
