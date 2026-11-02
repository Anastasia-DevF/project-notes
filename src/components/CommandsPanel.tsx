import type { SavedCommand } from "../types";
import { CommandIcon, CopyIcon, EditIcon, PlusIcon, TrashIcon } from "./Icons";
import { EmptyState } from "./EmptyState";

interface CommandsPanelProps {
  commands: SavedCommand[];
  onAdd: () => void;
  onEdit: (command: SavedCommand) => void;
  onDelete: (command: SavedCommand) => void;
  onCopy: (command: string) => void;
}

export function CommandsPanel({ commands, onAdd, onEdit, onDelete, onCopy }: CommandsPanelProps) {
  if (commands.length === 0) {
    return (
      <EmptyState
        compact
        icon={<CommandIcon />}
        title="No saved commands"
        description="Save commands you use often. They can be copied, but are never executed here."
        action={<button className="button button--primary" type="button" onClick={onAdd}><PlusIcon /> Add command</button>}
      />
    );
  }

  return (
    <div className="cards-list">
      {commands.map((entry) => (
        <article className="command-card" key={entry.id}>
          <div className="command-card__icon"><CommandIcon /></div>
          <div className="command-card__content">
            <h3>{entry.title}</h3>
            <code>{entry.command}</code>
          </div>
          <div className="card__actions command-card__actions">
            <button className="button button--copy" type="button" onClick={() => onCopy(entry.command)}><CopyIcon /> Copy</button>
            <button className="icon-button" type="button" onClick={() => onEdit(entry)} title="Edit command" aria-label={`Edit ${entry.title}`}><EditIcon /></button>
            <button className="icon-button icon-button--danger" type="button" onClick={() => onDelete(entry)} title="Delete command" aria-label={`Delete ${entry.title}`}><TrashIcon /></button>
          </div>
        </article>
      ))}
    </div>
  );
}
