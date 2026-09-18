import { NgClass } from '@angular/common';
import { afterRenderEffect, Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChatMessage } from '../chat-models';

@Component({
  selector: 'app-chat-window',
  imports: [MatCardModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, FormsModule, NgClass],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss',
})
export class ChatWindow {

  private chatContent = viewChild.required<ElementRef<HTMLDivElement>>('chatContent');

  title = input.required<string>();
  messages = input.required<ChatMessage[]>();
  isLoading = input(false);

  send = output<string>();

  userInput = signal('');

  constructor() {
    afterRenderEffect(() => {
      this.messages();
      this.isLoading();
      const el = this.chatContent().nativeElement;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }

  sendMessage() {
    const message = this.userInput().trim();
    if (message !== '' && !this.isLoading()) {
      this.send.emit(message);
      this.userInput.set('');
    }
  }
}
