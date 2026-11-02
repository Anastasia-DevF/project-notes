export type ProjectTab = "notes" | "commands" | "links";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedCommand {
  id: string;
  title: string;
  command: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedLink {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  notes: Note[];
  commands: SavedCommand[];
  links: SavedLink[];
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  version: 1;
  projects: Project[];
  selectedProjectId: string | null;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error";
  message: string;
}
