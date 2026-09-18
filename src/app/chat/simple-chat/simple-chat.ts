import { Component, inject, signal } from '@angular/core';
import { ChatMessage } from '../chat-models';
import { ChatService } from '../chat-service';
import { ChatWindow } from '../chat-window/chat-window';

@Component({
  selector: 'app-simple-chat',
  imports: [ChatWindow],
  templateUrl: './simple-chat.html',
  styleUrl: './simple-chat.scss',
})
export class SimpleChat {

  private chatService = inject(ChatService);

  isLoading = signal(false);

  messages = signal<ChatMessage[]>([
    { text: 'Hello! How can I assist you today?', sender: 'bot' }
  ]);

  sendMessage(text: string) {
    this.updateMessages({ text, sender: 'user' });
    this.isLoading.set(true);
    this.chatService.simpleChat(text)
    .subscribe({
      next: (response) => {
        this.updateMessages({ text: response.message, sender: 'bot' });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error sending message:', err);
        this.updateMessages({ text: 'Sorry, something went wrong. Please try again.', sender: 'bot' });
        this.isLoading.set(false);
      }
    });
  }

  private updateMessages(message: ChatMessage) {
    this.messages.update(messages => [...messages, message]);
  }
}
