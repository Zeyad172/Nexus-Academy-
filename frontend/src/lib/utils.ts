import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BACKEND_BASE_URL } from "./api-client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMediaUrl(fileId: string | undefined) {
  if (!fileId) return "";
  if (
    fileId.startsWith("http") ||
    fileId.startsWith("/") ||
    fileId.includes(".") ||
    fileId.includes("base64")
  ) {
    return fileId;
  }
  return `${BACKEND_BASE_URL}/media/${fileId}`;
}
