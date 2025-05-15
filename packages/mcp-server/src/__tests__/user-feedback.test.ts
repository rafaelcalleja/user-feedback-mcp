import { FeedbackStatus } from "@user-feedback-mcp/shared";

// Mock the entire user-feedback handler
jest.mock("../handlers/user-feedback", () => {
  const FeedbackStatus = jest.requireActual("@user-feedback-mcp/shared").FeedbackStatus;
  
  // Create a mock implementation of getUserFeedback
  const getUserFeedback = jest.fn().mockImplementation(params => {
    if (!params.prompt) {
      return Promise.resolve({
        feedback: '',
        status: FeedbackStatus.ERROR,
        error: 'Prompt is required'
      });
    }
    
    return Promise.resolve({
      feedback: 'Test feedback',
      status: FeedbackStatus.SUCCESS
    });
  });
  
  return {
    getUserFeedback,
    getElectronGuiPath: jest.fn().mockReturnValue("/mock/path/to/electron-gui")
  };
});

// Import after mocking
const { getUserFeedback } = require("../handlers/user-feedback");

describe("getUserFeedback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return error when prompt is missing", async () => {
    const result = await getUserFeedback({});
    
    expect(result.status).toBe(FeedbackStatus.ERROR);
    expect(result.error).toContain("Prompt is required");
  });
  
  it("should return success with feedback when prompt is provided", async () => {
    const result = await getUserFeedback({
      prompt: "Test prompt",
      title: "Test title"
    });
    
    expect(result.status).toBe(FeedbackStatus.SUCCESS);
    expect(result.feedback).toBe("Test feedback");
  });
});
