import { afterRenderEffect, Component, computed, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BoltIcon } from '../../shared/bolt-icon/bolt-icon';
import { ChatMessage } from '../chat-models';
import { MarkdownPipe } from '../markdown/markdown-pipe';

const SUGGESTIONS = [
  'Explain signals in Angular',
  'Draft a REST API for a todo list',
  'Summarize a long article',
  'Help me debug a stack trace',
];

@Component({
  selector: 'app-chat-window',
  imports: [MatCardModule, MatButtonModule, MatIconModule, FormsModule, MarkdownPipe, BoltIcon],
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

  suggestions = SUGGESTIONS;
  isEmpty = computed(() => this.messages().length === 0 && !this.isLoading());

  constructor() {
    afterRenderEffect(() => {
      this.messages();
      this.isLoading();
      const el = this.chatContent().nativeElement;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }

  sendMessage() {
    this.submit(this.userInput().trim());
  }

  sendSuggestion(text: string) {
    this.submit(text);
  }

  private submit(message: string) {
    if (message !== '' && !this.isLoading()) {
      this.send.emit(message);
      this.userInput.set('');
    }
  }
}
