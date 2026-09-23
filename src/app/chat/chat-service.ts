import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  ChatHistoryResponse,
  ChatReplyResponse,
  ChatSummaryResponse,
  NewChatResponse,
  SimpleChatResponse,
} from './chat-models';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly API = '/api/v1/chat';

  private http = inject(HttpClient);

  simpleChat(message: string) {
    return this.http.post<SimpleChatResponse>(`${this.API}/simple`, { message });
  }

  getAllChats() {
    return this.http.get<ChatSummaryResponse[]>(`${this.API}/memory`);
  }

  getChatMessages(chatId: string) {
    return this.http.get<ChatHistoryResponse[]>(`${this.API}/memory/${chatId}`);
  }

  newChat(message: string) {
    return this.http.post<NewChatResponse>(`${this.API}/memory/new`, { message });
  }

  continueChat(chatId: string, message: string) {
    return this.http.post<ChatReplyResponse>(`${this.API}/memory/${chatId}`, { message });
  }

  updateChatDescription(chatId: string, description: string) {
    return this.http.patch<ChatSummaryResponse>(`${this.API}/memory/${chatId}`, { description });
  }

  deleteChat(chatId: string) {
    return this.http.delete<void>(`${this.API}/memory/${chatId}`);
  }
}
