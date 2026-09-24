export interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  /** Translation key; when set it is shown instead of `text`, so it follows the language. */
  i18nKey?: string;
}

export interface SimpleChatResponse {
  message: string;
}

export interface ChatReplyResponse {
  message: string;
}

export interface NewChatResponse {
  chatId: string;
  description: string;
  response: string;
}

export interface ChatSummaryResponse {
  id: string;
  description: string;
}

export interface ChatProblemDetail {
  status?: number;
  detail?: string;
  errors?: Record<string, string>;
}

export interface ChatHistoryResponse {
  content: string;
  type: 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL';
  timestamp: string;
}
