import { FeedbackStatus, UserFeedbackResponse } from './types';

/**
 * Custom error class for feedback operation errors
 */
export class FeedbackError extends Error {
  status: FeedbackStatus;
  
  constructor(message: string, status: FeedbackStatus) {
    super(message);
    this.name = 'FeedbackError';
    this.status = status;
  }
}

/**
 * Creates an error response
 */
export function createErrorResponse(
  error: Error | string,
  status: FeedbackStatus = FeedbackStatus.ERROR
): UserFeedbackResponse {
  const message = typeof error === 'string' ? error : error.message;
  
  return {
    feedback: '',
    status,
    error: message
  };
}

/**
 * Creates a timeout response
 */
export function createTimeoutResponse(): UserFeedbackResponse {
  return {
    feedback: '',
    status: FeedbackStatus.TIMEOUT,
    error: 'Operation timed out waiting for user feedback'
  };
}
