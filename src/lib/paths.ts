import { access, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const expandTilde = (value: string): string => {
  if (value === "~") {
    return os.homedir();
  }

  if (value.startsWith("~/") || value.startsWith("~\\")) {
    return path.join(os.homedir(), value.slice(2));
  }

  return value;
};

export const getDefaultDownloadDir = (): string => path.join(os.homedir(), "Videos", "PacVideo");

export const getConfigDir = (): string => {
  if (process.platform === "win32") {
    const appData = process.env.APPDATA ?? path.join(os.homedir(), "AppData", "Roaming");
    return path.join(appData, "pacv");
  }

  return path.join(os.homedir(), ".config", "pacv");
};

export const getConfigPath = (): string => path.join(getConfigDir(), "config.json");

export const getHistoryPath = (): string => path.join(getConfigDir(), "history.json");

export const ensureDirectory = async (directoryPath: string): Promise<void> => {
  await mkdir(expandTilde(directoryPath), { recursive: true });
};

export const pathExists = async (targetPath: string): Promise<boolean> => {
  try {
    await access(expandTilde(targetPath));
    return true;
  } catch {
    return false;
  }
};

export const resolveProjectRoot = (importMetaUrl: string): string => {
  const filePath = fileURLToPath(importMetaUrl);
  let currentDirectory = path.dirname(filePath);

  while (true) {
    const baseName = path.basename(currentDirectory);
    if (baseName === "dist" || baseName === "src") {
      return path.dirname(currentDirectory);
    }

    const parentDirectory = path.dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      return path.dirname(filePath);
    }

    currentDirectory = parentDirectory;
  }
};

export const getManagedBinaryDir = (): string => {
  if (process.platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local");
    return path.join(localAppData, "pacv");
  }

  return path.join(os.homedir(), ".local", "bin");
};

export const getVendorBinaryDir = (importMetaUrl: string): string => path.join(resolveProjectRoot(importMetaUrl), "vendor", "bin");
