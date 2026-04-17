import { NgClass } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChatService } from '../chat-service';

@Component({
  selector: 'app-simple-chat',
  imports: [MatCardModule, MatInputModule, MatButtonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, FormsModule, NgClass],
  templateUrl: './simple-chat.html',
  styleUrl: './simple-chat.scss',
})
export class SimpleChat {

  @ViewChild('chatContent')
  private chatContent!: ElementRef<HTMLDivElement>;

  private chatService = inject(ChatService);

  userInput = signal('');
  isLoading = signal(false);

  messages = signal([
    { text: 'Hello! How can I assist you today?', sender: 'bot' }
  ]);

  sendMessage() {
    this.trimUserMessage();
    if (this.userInput() !== '' && !this.isLoading()) {
      this.updateMessages({ text: this.userInput(), sender: 'user' });
      this.sendChatMessage();
      this.isLoading.set(true);
    }
  }

  private sendChatMessage() {
    this.chatService.sendChatMessage(this.userInput())
    .subscribe({
      next: (response) => {
        this.updateMessages({ text: response.message, sender: 'bot' });
        this.isLoading.set(false);
        this.userInput.set('');
      },
      error: (err) => {
        console.error('Error sending message:', err);
        this.updateMessages({ text: 'Sorry, something went wrong. Please try again.', sender: 'bot' });
        this.isLoading.set(false);
      }
    });
  }

  private updateMessages(message: { text: string; sender: 'user' | 'bot' }) {
    this.messages.update(messages => [...messages, message]);
    this.scrollToBottom();
  }

  private trimUserMessage() {
    const trimmed = this.userInput().trim();
    this.userInput.set(trimmed);
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatContent) {
        this.chatContent.nativeElement.scrollTop = this.chatContent.nativeElement.scrollHeight;
      }
    }, 50);
  }
}
