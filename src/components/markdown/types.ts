/**
 * Shared types for markdown processing pipeline.
 */

export interface ExtractionResult {
  text: string;
  store: Record<string, string>;
}
