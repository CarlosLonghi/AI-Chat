import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-simple-chat',
  imports: [MatCardModule, MatInputModule, MatButtonModule, MatButtonModule, MatIconModule, FormsModule, NgClass],
  templateUrl: './simple-chat.html',
  styleUrl: './simple-chat.scss',
})
export class SimpleChat {
  userInput = signal('');

  messages = signal([
    { text: 'Hello! How can I assist you today?', sender: 'bot' }
  ]);

  sendMessage() {
    this.trimUserMessage();
    if (this.userInput() !== '') {
      this.updateMessages({ text: this.userInput(), sender: 'user' });
      this.userInput.set('');
      this.simulateBotResponse();
    }
  }

  private updateMessages(message: { text: string; sender: 'user' | 'bot' }) {
    this.messages.update(messages => [...messages, message]);
  }

  private trimUserMessage() {
    const trimmed = this.userInput().trim();
    this.userInput.set(trimmed);
  }

  private simulateBotResponse() {
    setTimeout(() => {
      const botResponse = 'This is a simulated response from the bot.';
      this.updateMessages({ text: botResponse, sender: 'bot' });
    }, 2000);
  }
}
