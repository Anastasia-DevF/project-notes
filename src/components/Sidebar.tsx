import type { Project } from "../types";
import { EditIcon, FolderIcon, PlusIcon, TrashIcon } from "./Icons";

interface SidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelect: (projectId: string) => void;
  onCreate: () => void;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function Sidebar({ projects, selectedProjectId, onSelect, onCreate, onRename, onDelete }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand__mark"><FolderIcon /></div>
        <div>
          <strong>Project Notes</strong>
          <span>Private workspace</span>
        </div>
      </div>

      <div className="sidebar__heading">
        <span>Projects</span>
        <span className="count-badge">{projects.length}</span>
      </div>

      <nav className="project-list" aria-label="Projects">
        {projects.length === 0 ? (
          <p className="sidebar__empty">Your projects will appear here.</p>
        ) : (
          projects.map((project) => (
            <div
              className={`project-item ${project.id === selectedProjectId ? "project-item--active" : ""}`}
              key={project.id}
            >
              <button className="project-item__select" type="button" onClick={() => onSelect(project.id)}>
                <span className="project-item__dot" />
                <span>{project.name}</span>
              </button>
              <div className="project-item__actions">
                <button type="button" onClick={() => onRename(project)} aria-label={`Rename ${project.name}`} title="Rename project">
                  <EditIcon />
                </button>
                <button type="button" onClick={() => onDelete(project)} aria-label={`Delete ${project.name}`} title="Delete project">
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))
        )}
      </nav>

      <button className="button button--new-project" type="button" onClick={onCreate}>
        <PlusIcon /> New project
      </button>
      <div className="sidebar__footer"><span className="status-dot" /> Stored locally on this device</div>
    </aside>
  );
}
