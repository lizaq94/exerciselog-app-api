export const AI_PARSER_ERROR_MESSAGES = {
  EMPTY_RESPONSE: 'AI returned empty response. Please try again.',
  INVALID_JSON: 'AI returned invalid JSON. Please try again.',
  VALIDATION_FAILED: 'AI response validation failed',
} as const;

export const AI_PARSER_LOG_MESSAGES = {
  PARSING_START: 'Parsing AI response...',
  JSON_PARSED: 'JSON parsed successfully',
  VALIDATION_SUCCESS: 'AI response validated successfully',
} as const;
