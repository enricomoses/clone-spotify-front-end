import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a UUID v4 for streaming history and other IDs.
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Generate a stream ID in a specific format: STREAM-{uuid}
 */
export function generateStreamId(): string {
  return `STREAM-${uuidv4()}`;
}
