import { V } from '@angular/cdk/keycodes';
import { NgClass } from '@angular/common';
import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-simple-chat',
  imports: [MatCardModule, MatInputModule, MatButtonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, FormsModule, NgClass],
  templateUrl: './simple-chat.html',
  styleUrl: './simple-chat.scss',
})
export class SimpleChat {

  @ViewChild('chatContent')
  private chatContent!: ElementRef<HTMLDivElement>;

  userInput = signal('');
  isLoading = signal(false);

  messages = signal([
    { text: 'Hello! How can I assist you today?', sender: 'bot' }
  ]);

  sendMessage() {
    this.trimUserMessage();
    if (this.userInput() !== '' && !this.isLoading()) {
      this.updateMessages({ text: this.userInput(), sender: 'user' });
      this.userInput.set('');
      this.isLoading.set(true);
      this.simulateBotResponse();
    }
  }

  private updateMessages(message: { text: string; sender: 'user' | 'bot' }) {
    this.messages.update(messages => [...messages, message]);
    this.scrollToBottom();
  }

  private trimUserMessage() {
    const trimmed = this.userInput().trim();
    this.userInput.set(trimmed);
  }

  private simulateBotResponse() {
    setTimeout(() => {
      const botResponse = 'This is a simulated response from the bot.';
      this.updateMessages({ text: botResponse, sender: 'bot' });
      this.isLoading.set(false);
    }, 2000);
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatContent) {
        this.chatContent.nativeElement.scrollTop = this.chatContent.nativeElement.scrollHeight;
      }
    }, 50);
  }
}
