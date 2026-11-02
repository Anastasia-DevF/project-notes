import type { SavedLink } from "../types";
import { EditIcon, ExternalIcon, LinkIcon, PlusIcon, TrashIcon } from "./Icons";
import { EmptyState } from "./EmptyState";

interface LinksPanelProps {
  links: SavedLink[];
  onAdd: () => void;
  onEdit: (link: SavedLink) => void;
  onDelete: (link: SavedLink) => void;
  onOpen: (url: string) => void;
}

function getHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export function LinksPanel({ links, onAdd, onEdit, onDelete, onOpen }: LinksPanelProps) {
  if (links.length === 0) {
    return (
      <EmptyState
        compact
        icon={<LinkIcon />}
        title="No useful links"
        description="Collect documentation, dashboards and other project resources here."
        action={<button className="button button--primary" type="button" onClick={onAdd}><PlusIcon /> Add link</button>}
      />
    );
  }

  return (
    <div className="links-grid">
      {links.map((entry) => (
        <article className="link-card" key={entry.id}>
          <div className="link-card__icon"><LinkIcon /></div>
          <div className="link-card__content">
            <h3>{entry.title}</h3>
            <span>{getHost(entry.url)}</span>
          </div>
          <div className="card__actions link-card__actions">
            <button className="button button--open" type="button" onClick={() => onOpen(entry.url)}><ExternalIcon /> Open</button>
            <button className="icon-button" type="button" onClick={() => onEdit(entry)} title="Edit link" aria-label={`Edit ${entry.title}`}><EditIcon /></button>
            <button className="icon-button icon-button--danger" type="button" onClick={() => onDelete(entry)} title="Delete link" aria-label={`Delete ${entry.title}`}><TrashIcon /></button>
          </div>
        </article>
      ))}
    </div>
  );
}
