import { afterRenderEffect, Component, computed, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { BoltIcon } from '../../shared/bolt-icon/bolt-icon';
import { ChatMessage } from '../chat-models';
import { MarkdownPipe } from '../markdown/markdown-pipe';

const SUGGESTION_KEYS = [
  'chat.suggestions.dinner',
  'chat.suggestions.boss',
  'chat.suggestions.car',
  'chat.suggestions.trip',
];

@Component({
  selector: 'app-chat-window',
  imports: [MatCardModule, MatButtonModule, MatIconModule, FormsModule, MarkdownPipe, BoltIcon, TranslocoPipe],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss',
})
export class ChatWindow {

  private transloco = inject(TranslocoService);
  private chatContent = viewChild.required<ElementRef<HTMLDivElement>>('chatContent');

  title = input.required<string>();
  messages = input.required<ChatMessage[]>();
  isLoading = input(false);

  send = output<string>();

  userInput = signal('');

  suggestionKeys = SUGGESTION_KEYS;
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

  sendSuggestion(key: string) {
    this.submit(this.transloco.translate(key));
  }

  private submit(message: string) {
    if (message !== '' && !this.isLoading()) {
      this.send.emit(message);
      this.userInput.set('');
    }
  }
}
