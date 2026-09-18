import { Component, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ChatHistoryResponse, ChatMessage, ChatSummaryResponse } from '../chat-models';
import { ChatService } from '../chat-service';
import { ChatWindow } from '../chat-window/chat-window';

const WELCOME_MESSAGE: ChatMessage = { text: 'Hello! How can I assist you today?', sender: 'bot' };
const ERROR_MESSAGE: ChatMessage = { text: 'Sorry, something went wrong. Please try again.', sender: 'bot' };

@Component({
  selector: 'app-chat-memory',
  imports: [ChatWindow, MatButtonModule, MatIconModule, MatListModule, RouterLink, RouterLinkActive],
  templateUrl: './chat-memory.html',
  styleUrl: './chat-memory.scss',
})
export class ChatMemory {

  private chatService = inject(ChatService);
  private router = inject(Router);

  chatId = input<string>();

  chats = signal<ChatSummaryResponse[]>([]);
  messages = signal<ChatMessage[]>([WELCOME_MESSAGE]);
  isLoading = signal(false);

  private activeChatId: string | undefined;

  constructor() {
    this.loadChats();
    effect(() => this.openChat(this.chatId()));
  }

  sendMessage(text: string) {
    this.addMessage({ text, sender: 'user' });
    this.isLoading.set(true);

    if (this.activeChatId) {
      this.continueChat(this.activeChatId, text);
    } else {
      this.startChat(text);
    }
  }

  private loadChats() {
    this.chatService.getAllChats().subscribe({
      next: (chats) => this.chats.set(chats),
      error: (err) => console.error('Error loading chats:', err),
    });
  }

  private openChat(chatId: string | undefined) {
    if (chatId === this.activeChatId) {
      return;
    }
    this.activeChatId = chatId;

    if (!chatId) {
      this.messages.set([WELCOME_MESSAGE]);
      this.isLoading.set(false);
      return;
    }

    this.messages.set([]);
    this.isLoading.set(true);
    this.chatService.getChatMessages(chatId).subscribe({
      next: (history) => {
        if (this.activeChatId !== chatId) return;
        this.messages.set(this.toMessages(history));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading chat history:', err);
        if (this.activeChatId !== chatId) return;
        this.messages.set([ERROR_MESSAGE]);
        this.isLoading.set(false);
      },
    });
  }

  private startChat(text: string) {
    this.chatService.newChat(text).subscribe({
      next: ({ chatId, description, response }) => {
        this.chats.update(chats => [{ id: chatId, description }, ...chats]);
        // Only take over the view if the user is still on the "new chat" screen.
        if (this.activeChatId !== undefined) return;
        this.activeChatId = chatId;
        this.addMessage({ text: response, sender: 'bot' });
        this.isLoading.set(false);
        this.router.navigate(['/chat-memory', chatId]);
      },
      error: (err) => this.handleSendError(err, undefined),
    });
  }

  private continueChat(chatId: string, text: string) {
    this.chatService.continueChat(chatId, text).subscribe({
      next: (response) => {
        if (this.activeChatId !== chatId) return;
        this.addMessage({ text: response.message, sender: 'bot' });
        this.isLoading.set(false);
      },
      error: (err) => this.handleSendError(err, chatId),
    });
  }

  private handleSendError(err: unknown, chatId: string | undefined) {
    console.error('Error sending message:', err);
    if (this.activeChatId !== chatId) return;
    this.addMessage(ERROR_MESSAGE);
    this.isLoading.set(false);
  }

  private toMessages(history: ChatHistoryResponse[]): ChatMessage[] {
    return history
      .filter(m => m.type === 'USER' || m.type === 'ASSISTANT')
      .map(m => ({ text: m.content, sender: m.type === 'USER' ? 'user' : 'bot' }));
  }

  private addMessage(message: ChatMessage) {
    this.messages.update(messages => [...messages, message]);
  }
}
