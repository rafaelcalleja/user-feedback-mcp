import * as fs from "fs-extra";
import * as path from "path";
import { TEMP_DIR, FEEDBACK_FILE_NAME } from "./constants";
import {
  FeedbackFile,
  UserFeedbackResponse,
  FeedbackStatus,
  ImageData,
} from "./types";

/**
 * Ensures the temporary directory exists
 */
export async function ensureTempDir(): Promise<void> {
  await fs.ensureDir(TEMP_DIR);
}

/**
 * Generates a unique file path for the feedback file
 */
export function generateFeedbackFilePath(): string {
  const uniqueId = Date.now().toString();
  return path.join(TEMP_DIR, `${uniqueId}-${FEEDBACK_FILE_NAME}`);
}

/**
 * Writes feedback data to a file
 * @param filePath Path to the feedback file
 * @param feedback Feedback text
 * @param cancelled Whether the feedback was cancelled by the user
 * @param images Optional array of images to include in the feedback
 */
export async function writeFeedbackToFile(
  filePath: string,
  feedback: string,
  cancelled: boolean = false,
  images?: ImageData[]
): Promise<void> {
  const data: FeedbackFile = {
    feedback,
    timestamp: Date.now(),
    cancelled: cancelled,
  };

  // Add images if provided
  if (images && images.length > 0) {
    data.images = images;
  }

  await fs.writeJson(filePath, data, { spaces: 2 });
}

/**
 * Reads feedback data from a file
 */
export async function readFeedbackFromFile(
  filePath: string
): Promise<UserFeedbackResponse> {
  try {
    const data = (await fs.readJson(filePath)) as FeedbackFile;

    // Check if the feedback was cancelled by the user
    if (data.cancelled) {
      return {
        feedback: "",
        status: FeedbackStatus.CANCELLED,
        error: "User cancelled feedback by closing the window",
      };
    }

    const response: UserFeedbackResponse = {
      feedback: data.feedback,
      status: FeedbackStatus.SUCCESS,
    };

    // Include images if they exist
    if (data.images && data.images.length > 0) {
      response.images = data.images;
    }

    return response;
  } catch (error: any) {
    return {
      feedback: "",
      status: FeedbackStatus.ERROR,
      error: `Failed to read feedback file: ${error.message || String(error)}`,
    };
  }
}

/**
 * Cleans up the feedback file
 */
export async function cleanupFeedbackFile(filePath: string): Promise<void> {
  try {
    await fs.remove(filePath);
  } catch (error: any) {
    console.error(
      `Failed to clean up feedback file: ${error.message || String(error)}`
    );
  }
}
