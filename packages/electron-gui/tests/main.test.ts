import * as path from "path";

// Mock dependencies
const mockOn = jest.fn();
const mockExit = jest.fn();
const mockHandle = jest.fn();

const mockApp = {
  on: mockOn,
  exit: mockExit,
};

const mockBrowserWindow = jest.fn().mockImplementation(() => ({
  loadURL: jest.fn(),
  on: jest.fn(),
  webContents: {
    send: jest.fn(),
  },
}));

const mockIpcMain = {
  handle: mockHandle,
};

jest.mock("electron", () => ({
  app: mockApp,
  BrowserWindow: mockBrowserWindow,
  ipcMain: mockIpcMain,
}));

jest.mock("fs-extra");
jest.mock("path");

describe("Electron Main Process", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up environment variables
    process.env.USER_FEEDBACK_PROMPT = "Test prompt";
    process.env.USER_FEEDBACK_FILE = "/tmp/feedback.json";
  });

  it("should create a browser window on app ready", () => {
    // Simulate the app ready event handler
    const readyCallback = jest.fn();
    mockOn.mockImplementation((event, callback) => {
      if (event === "ready") {
        readyCallback.mockImplementation(callback);
      }
      return mockApp;
    });

    // Import the main module to trigger the event handlers
    jest.isolateModules(() => {
      require("../dist/main");
    });

    // Trigger the ready callback
    readyCallback();

    // Verify BrowserWindow was called
    expect(mockBrowserWindow).toHaveBeenCalled();
  });

  it("should handle get-prompt IPC message", () => {
    // Set up the environment variable
    process.env.USER_FEEDBACK_PROMPT = "Test prompt";

    // Simulate the IPC handler registration
    let promptHandler: any;
    mockHandle.mockImplementation((channel, handler) => {
      if (channel === "get-prompt") {
        promptHandler = handler;
      }
    });

    // Import the main module to register handlers
    jest.isolateModules(() => {
      require("../dist/main");
    });

    // Call the handler
    const result = promptHandler();

    // Verify the result
    expect(result).toBe("Test prompt");
  });

  it("should handle submit-feedback IPC message", async () => {
    // Mock the shared module's writeFeedbackToFile function
    jest.mock("@get-user-feedback/shared", () => ({
      ENV_PROMPT: "USER_FEEDBACK_PROMPT",
      ENV_TITLE: "USER_FEEDBACK_TITLE",
      ENV_TIMEOUT: "USER_FEEDBACK_TIMEOUT",
      ENV_FEEDBACK_FILE: "USER_FEEDBACK_FILE",
      DEFAULT_WINDOW_TITLE: "User Feedback",
      DEFAULT_WINDOW_WIDTH: 600,
      DEFAULT_WINDOW_HEIGHT: 400,
      writeFeedbackToFile: jest.fn().mockResolvedValue(undefined),
    }));

    // Set up environment variables
    process.env.USER_FEEDBACK_FILE = "/tmp/feedback.json";

    // Simulate the IPC handler registration
    let feedbackHandler: any;
    mockHandle.mockImplementation((channel, handler) => {
      if (channel === "submit-feedback") {
        feedbackHandler = handler;
      }
    });

    // Import the main module to register handlers
    jest.isolateModules(() => {
      require("../dist/main");
    });

    // Call the handler
    const result = await feedbackHandler({}, "Test feedback");

    // Verify the result
    expect(result).toEqual({ success: true });
  });
});
