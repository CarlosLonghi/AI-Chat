export interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
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

export interface ChatHistoryResponse {
  content: string;
  type: 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL';
  timestamp: string;
}
