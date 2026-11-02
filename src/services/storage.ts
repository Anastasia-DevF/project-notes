import { load, type Store } from "@tauri-apps/plugin-store";
import type { AppData, Project } from "../types";

const STORE_FILE = "project-notes.json";
const DATA_KEY = "app-data";

const emptyData: AppData = {
  version: 1,
  projects: [],
  selectedProjectId: null,
};

let storePromise: Promise<Store> | null = null;

function getStore(): Promise<Store> {
  if (!storePromise) {
    storePromise = load(STORE_FILE, { autoSave: false });
  }
  return storePromise;
}

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== "object") return false;
  const project = value as Partial<Project>;
  return (
    typeof project.id === "string" &&
    typeof project.name === "string" &&
    Array.isArray(project.notes) &&
    Array.isArray(project.commands) &&
    Array.isArray(project.links)
  );
}

function parseStoredData(value: unknown): AppData {
  if (!value || typeof value !== "object") return emptyData;

  const data = value as Partial<AppData>;
  if (!Array.isArray(data.projects) || !data.projects.every(isProject)) {
    throw new Error("The saved project data has an invalid format.");
  }

  const selectedProjectId =
    typeof data.selectedProjectId === "string" &&
    data.projects.some((project) => project.id === data.selectedProjectId)
      ? data.selectedProjectId
      : data.projects[0]?.id ?? null;

  return {
    version: 1,
    projects: data.projects,
    selectedProjectId,
  };
}

export async function loadAppData(): Promise<AppData> {
  try {
    const store = await getStore();
    const storedData = await store.get<unknown>(DATA_KEY);
    return parseStoredData(storedData);
  } catch (error) {
    storePromise = null;
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not load local data: ${message}`);
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  try {
    const store = await getStore();
    await store.set(DATA_KEY, data);
    await store.save();
  } catch (error) {
    storePromise = null;
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not save local data: ${message}`);
  }
}
