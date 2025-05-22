/**
 * Interface for image data
 */
export interface ImageData {
  /**
   * Base64 encoded image data
   */
  data: string;

  /**
   * MIME type of the image (e.g., 'image/png', 'image/jpeg')
   */
  mimeType: string;
}

/**
 * Interface for the user feedback request
 */
export interface UserFeedbackRequest {
  /**
   * The prompt to display to the user
   */
  prompt: string;
}

/**
 * Interface for the user feedback response
 */
export interface UserFeedbackResponse {
  /**
   * The feedback text provided by the user
   */
  feedback: string;

  /**
   * Status of the feedback operation
   */
  status: FeedbackStatus;

  /**
   * Error message if status is ERROR
   */
  error?: string;

  /**
   * Optional array of images included in the feedback
   */
  images?: ImageData[];
}

/**
 * Enum for feedback operation status
 */
export enum FeedbackStatus {
  SUCCESS = "success",
  ERROR = "error",
  TIMEOUT = "timeout",
  CANCELLED = "cancelled",
}

/**
 * Interface for the file-based communication
 */
export interface FeedbackFile {
  /**
   * The feedback text provided by the user
   */
  feedback: string;

  /**
   * Timestamp when the feedback was submitted
   */
  timestamp: number;

  /**
   * Whether the feedback was cancelled by the user
   */
  cancelled?: boolean;

  /**
   * Optional array of images included in the feedback
   */
  images?: ImageData[];
}
