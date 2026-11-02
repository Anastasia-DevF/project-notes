import { useCallback, useEffect, useMemo, useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { CommandsPanel } from "./components/CommandsPanel";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { EmptyState } from "./components/EmptyState";
import { EntryForm, type EntryFormValue } from "./components/EntryForm";
import { CommandIcon, FolderIcon, LinkIcon, NoteIcon, PlusIcon } from "./components/Icons";
import { LinksPanel } from "./components/LinksPanel";
import { Modal } from "./components/Modal";
import { NotesPanel } from "./components/NotesPanel";
import { ProjectForm } from "./components/ProjectForm";
import { Sidebar } from "./components/Sidebar";
import { Toasts } from "./components/Toasts";
import { loadAppData, saveAppData } from "./services/storage";
import type { AppData, Note, Project, ProjectTab, SavedCommand, SavedLink, ToastMessage } from "./types";

type Entry = Note | SavedCommand | SavedLink;

type DialogState =
  | { type: "createProject" }
  | { type: "renameProject"; project: Project }
  | { type: "deleteProject"; project: Project }
  | { type: "createEntry"; kind: ProjectTab }
  | { type: "editEntry"; kind: ProjectTab; entry: Entry }
  | { type: "deleteEntry"; kind: ProjectTab; entry: Entry }
  | null;

const tabConfig = [
  { id: "notes", label: "Notes", icon: NoteIcon },
  { id: "commands", label: "Commands", icon: CommandIcon },
  { id: "links", label: "Links", icon: LinkIcon },
] satisfies { id: ProjectTab; label: string; icon: typeof NoteIcon }[];

const singularNames: Record<ProjectTab, string> = {
  notes: "note",
  commands: "command",
  links: "link",
};

function makeId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function getEntryValue(kind: ProjectTab, entry: Entry): string {
  if (kind === "notes") return (entry as Note).content;
  if (kind === "commands") return (entry as SavedCommand).command;
  return (entry as SavedLink).url;
}

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProjectTab>("notes");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const addToast = useCallback((type: ToastMessage["type"], message: string) => {
    const id = makeId();
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }, []);

  useEffect(() => {
    let isCurrent = true;
    loadAppData()
      .then((data) => {
        if (!isCurrent) return;
        setProjects(data.projects);
        setSelectedProjectId(data.selectedProjectId);
      })
      .catch((error: Error) => {
        if (isCurrent) addToast("error", error.message);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => { isCurrent = false; };
  }, [addToast]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const persist = useCallback((nextProjects: Project[], nextSelectedId: string | null) => {
    setProjects(nextProjects);
    setSelectedProjectId(nextSelectedId);
    const data: AppData = { version: 1, projects: nextProjects, selectedProjectId: nextSelectedId };
    void saveAppData(data).catch((error: Error) => addToast("error", error.message));
  }, [addToast]);

  const selectProject = (projectId: string) => {
    setActiveTab("notes");
    persist(projects, projectId);
  };

  const createProject = (name: string) => {
    const timestamp = now();
    const project: Project = {
      id: makeId(),
      name,
      notes: [],
      commands: [],
      links: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    persist([...projects, project], project.id);
    setActiveTab("notes");
    setDialog(null);
  };

  const renameProject = (projectId: string, name: string) => {
    const nextProjects = projects.map((project) =>
      project.id === projectId ? { ...project, name, updatedAt: now() } : project,
    );
    persist(nextProjects, selectedProjectId);
    setDialog(null);
  };

  const deleteProject = (projectId: string) => {
    const nextProjects = projects.filter((project) => project.id !== projectId);
    const nextSelectedId = selectedProjectId === projectId
      ? nextProjects[0]?.id ?? null
      : selectedProjectId;
    persist(nextProjects, nextSelectedId);
    setActiveTab("notes");
    setDialog(null);
  };

  const updateActiveProject = (update: (project: Project) => Project) => {
    if (!selectedProjectId) return;
    const nextProjects = projects.map((project) =>
      project.id === selectedProjectId ? update(project) : project,
    );
    persist(nextProjects, selectedProjectId);
  };

  const createEntry = (kind: ProjectTab, value: EntryFormValue) => {
    const timestamp = now();
    updateActiveProject((project) => {
      const base = { id: makeId(), title: value.title, createdAt: timestamp, updatedAt: timestamp };
      if (kind === "notes") return { ...project, notes: [...project.notes, { ...base, content: value.value }], updatedAt: timestamp };
      if (kind === "commands") return { ...project, commands: [...project.commands, { ...base, command: value.value }], updatedAt: timestamp };
      return { ...project, links: [...project.links, { ...base, url: value.value }], updatedAt: timestamp };
    });
    setDialog(null);
  };

  const editEntry = (kind: ProjectTab, entryId: string, value: EntryFormValue) => {
    const timestamp = now();
    updateActiveProject((project) => {
      if (kind === "notes") {
        return { ...project, notes: project.notes.map((entry) => entry.id === entryId ? { ...entry, title: value.title, content: value.value, updatedAt: timestamp } : entry), updatedAt: timestamp };
      }
      if (kind === "commands") {
        return { ...project, commands: project.commands.map((entry) => entry.id === entryId ? { ...entry, title: value.title, command: value.value, updatedAt: timestamp } : entry), updatedAt: timestamp };
      }
      return { ...project, links: project.links.map((entry) => entry.id === entryId ? { ...entry, title: value.title, url: value.value, updatedAt: timestamp } : entry), updatedAt: timestamp };
    });
    setDialog(null);
  };

  const deleteEntry = (kind: ProjectTab, entryId: string) => {
    updateActiveProject((project) => {
      const updatedAt = now();
      if (kind === "notes") return { ...project, notes: project.notes.filter((entry) => entry.id !== entryId), updatedAt };
      if (kind === "commands") return { ...project, commands: project.commands.filter((entry) => entry.id !== entryId), updatedAt };
      return { ...project, links: project.links.filter((entry) => entry.id !== entryId), updatedAt };
    });
    setDialog(null);
  };

  const copyCommand = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      addToast("success", "Command copied to clipboard.");
    } catch {
      addToast("error", "Could not copy the command.");
    }
  };

  const openLink = async (url: string) => {
    try {
      await openUrl(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      addToast("error", `Could not open the link: ${message}`);
    }
  };

  const countForTab = (project: Project, tab: ProjectTab) => project[tab].length;

  const renderDialog = () => {
    if (!dialog) return null;

    if (dialog.type === "createProject") {
      return <Modal title="Create a project" description="Give this workspace a clear, memorable name." onClose={() => setDialog(null)} size="small"><ProjectForm submitLabel="Create project" onSubmit={createProject} onCancel={() => setDialog(null)} /></Modal>;
    }
    if (dialog.type === "renameProject") {
      return <Modal title="Rename project" onClose={() => setDialog(null)} size="small"><ProjectForm initialName={dialog.project.name} submitLabel="Save changes" onSubmit={(name) => renameProject(dialog.project.id, name)} onCancel={() => setDialog(null)} /></Modal>;
    }
    if (dialog.type === "deleteProject") {
      return <Modal title="Delete project?" onClose={() => setDialog(null)} size="small"><ConfirmDialog message={`“${dialog.project.name}” and all of its notes, commands and links will be permanently deleted.`} confirmLabel="Delete project" onConfirm={() => deleteProject(dialog.project.id)} onCancel={() => setDialog(null)} /></Modal>;
    }
    if (dialog.type === "createEntry") {
      const itemName = singularNames[dialog.kind];
      return <Modal title={`Add ${itemName}`} onClose={() => setDialog(null)}><EntryForm kind={dialog.kind} submitLabel={`Add ${itemName}`} onSubmit={(value) => createEntry(dialog.kind, value)} onCancel={() => setDialog(null)} /></Modal>;
    }
    if (dialog.type === "editEntry") {
      const itemName = singularNames[dialog.kind];
      return <Modal title={`Edit ${itemName}`} onClose={() => setDialog(null)}><EntryForm kind={dialog.kind} initialValue={{ title: dialog.entry.title, value: getEntryValue(dialog.kind, dialog.entry) }} submitLabel="Save changes" onSubmit={(value) => editEntry(dialog.kind, dialog.entry.id, value)} onCancel={() => setDialog(null)} /></Modal>;
    }
    return <Modal title={`Delete ${singularNames[dialog.kind]}?`} onClose={() => setDialog(null)} size="small"><ConfirmDialog message={`“${dialog.entry.title}” will be permanently deleted.`} confirmLabel={`Delete ${singularNames[dialog.kind]}`} onConfirm={() => deleteEntry(dialog.kind, dialog.entry.id)} onCancel={() => setDialog(null)} /></Modal>;
  };

  return (
    <div className="app-shell">
      <Sidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelect={selectProject}
        onCreate={() => setDialog({ type: "createProject" })}
        onRename={(project) => setDialog({ type: "renameProject", project })}
        onDelete={(project) => setDialog({ type: "deleteProject", project })}
      />

      <main className="main-content">
        {isLoading ? (
          <div className="loading-state"><div className="loading-spinner" /><span>Loading your projects…</span></div>
        ) : !selectedProject ? (
          <EmptyState
            icon={<FolderIcon />}
            title="Create your first project"
            description="Keep project notes, useful commands and important links together in one private workspace."
            action={<button className="button button--primary button--large" type="button" onClick={() => setDialog({ type: "createProject" })}><PlusIcon /> Create project</button>}
          />
        ) : (
          <>
            <header className="project-header">
              <div>
                <span className="eyebrow">Current project</span>
                <h1>{selectedProject.name}</h1>
              </div>
              <button className="button button--primary" type="button" onClick={() => setDialog({ type: "createEntry", kind: activeTab })}>
                <PlusIcon /> Add {singularNames[activeTab]}
              </button>
            </header>

            <div className="tabs" role="tablist" aria-label="Project content">
              {tabConfig.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    className={`tab ${activeTab === tab.id ? "tab--active" : ""}`}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon /> {tab.label}<span>{countForTab(selectedProject, tab.id)}</span>
                  </button>
                );
              })}
            </div>

            <section className="content-area" role="tabpanel">
              {activeTab === "notes" && <NotesPanel notes={selectedProject.notes} onAdd={() => setDialog({ type: "createEntry", kind: "notes" })} onEdit={(entry) => setDialog({ type: "editEntry", kind: "notes", entry })} onDelete={(entry) => setDialog({ type: "deleteEntry", kind: "notes", entry })} />}
              {activeTab === "commands" && <CommandsPanel commands={selectedProject.commands} onAdd={() => setDialog({ type: "createEntry", kind: "commands" })} onEdit={(entry) => setDialog({ type: "editEntry", kind: "commands", entry })} onDelete={(entry) => setDialog({ type: "deleteEntry", kind: "commands", entry })} onCopy={copyCommand} />}
              {activeTab === "links" && <LinksPanel links={selectedProject.links} onAdd={() => setDialog({ type: "createEntry", kind: "links" })} onEdit={(entry) => setDialog({ type: "editEntry", kind: "links", entry })} onDelete={(entry) => setDialog({ type: "deleteEntry", kind: "links", entry })} onOpen={openLink} />}
            </section>
          </>
        )}
      </main>

      {renderDialog()}
      <Toasts toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
    </div>
  );
}

export default App;
