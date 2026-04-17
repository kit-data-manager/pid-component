/**
 * Web Worker for PID auto-detection.
 *
 * Receives text content from the main thread, tokenizes it, and runs
 * the detection registry to identify PID candidates. Returns match
 * positions and renderer keys.
 *
 * This worker uses the self-contained detection-registry module which
 * has NO dependencies on @stencil/core, making it safe to run in a
 * Web Worker context.
 */

import { detectBestFit } from './detection-registry';
import type { DetectionMatch, WorkerInboundMessage, WorkerResultMessage } from './types';

/** Ordered renderer keys to use for detection. Set via 'init' message. */
let configuredRenderers: string[] | undefined;

/**
 * Characters that serve as token delimiters when scanning text.
 * PIDs are expected to be whitespace- or punctuation-delimited tokens.
 */
const DELIMITER_REGEX = /[\s,;()\[\]{}<>"']+/;

/**
 * Tokenize a text string into tokens with their positions.
 */
function tokenize(text: string): { token: string; start: number; end: number }[] {
  const tokens: { token: string; start: number; end: number }[] = [];
  let remaining = text;
  let offset = 0;

  while (remaining.length > 0) {
    // Find the next delimiter
    const match = DELIMITER_REGEX.exec(remaining);

    if (match === null) {
      // No more delimiters — the rest is a single token
      if (remaining.length > 0) {
        tokens.push({ token: remaining, start: offset, end: offset + remaining.length });
      }
      break;
    }

    // Extract the token before the delimiter
    if (match.index > 0) {
      const token = remaining.substring(0, match.index);
      tokens.push({ token, start: offset, end: offset + match.index });
    }

    // Skip past the delimiter
    offset += match.index + match[0].length;
    remaining = remaining.substring(match.index + match[0].length);
  }

  return tokens;
}

/**
 * Detect PIDs in a text string using the detection registry.
 */
function detectInText(text: string, orderedRendererKeys?: string[]): DetectionMatch[] {
  const tokens = tokenize(text);
  const matches: DetectionMatch[] = [];
  const effectiveKeys = orderedRendererKeys || configuredRenderers;

  for (const { token, start, end } of tokens) {
    // Skip very short tokens (unlikely to be PIDs)
    if (token.length < 2) continue;

    const rendererKey = detectBestFit(token, effectiveKeys);
    if (rendererKey !== null) {
      matches.push({ start, end, value: token, rendererKey });
    }
  }

  return matches;
}

/**
 * Handle incoming messages from the main thread.
 */
self.onmessage = (event: MessageEvent<WorkerInboundMessage>) => {
  const message = event.data;

  switch (message.type) {
    case 'init': {
      configuredRenderers = message.orderedRenderers;
      break;
    }

    case 'detect': {
      const matches = detectInText(message.text, message.orderedRenderers);
      const response: WorkerResultMessage = {
        type: 'result',
        id: message.id,
        matches,
      };
      self.postMessage(response);
      break;
    }
  }
};
