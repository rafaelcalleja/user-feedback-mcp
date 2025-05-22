import { contextBridge, ipcRenderer } from "electron";
import { ImageData } from "@user-feedback-mcp/shared";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  getPrompt: () => ipcRenderer.invoke("get-prompt"),
  submitFeedback: (feedback: string, images?: ImageData[]) =>
    ipcRenderer.invoke("submit-feedback", feedback, images),
});
