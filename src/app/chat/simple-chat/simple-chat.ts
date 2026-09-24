import { Component, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ChatMessage } from '../chat-models';
import { ChatService } from '../chat-service';
import { ChatWindow } from '../chat-window/chat-window';
import { QUICK_SUGGESTION_KEYS } from './quick-suggestions';

@Component({
  selector: 'app-simple-chat',
  imports: [ChatWindow, TranslocoPipe],
  templateUrl: './simple-chat.html',
  styleUrl: './simple-chat.scss',
})
export class SimpleChat {

  private chatService = inject(ChatService);

  isLoading = signal(false);

  messages = signal<ChatMessage[]>([]);

  suggestions = QUICK_SUGGESTION_KEYS;

  // Each question stands alone: sending a new one replaces the previous question and answer.
  sendMessage(text: string) {
    this.messages.set([{ text, sender: 'user' }]);
    this.isLoading.set(true);
    this.chatService.simpleChat(text)
    .subscribe({
      next: (response) => {
        this.updateMessages({ text: response.message, sender: 'bot' });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error sending message:', err);
        this.updateMessages({ text: 'Sorry, something went wrong. Please try again.', sender: 'bot', i18nKey: 'chat.error' });
        this.isLoading.set(false);
      }
    });
  }

  private updateMessages(message: ChatMessage) {
    this.messages.update(messages => [...messages, message]);
  }
}
