import { Clipboard } from '@angular/cdk/clipboard';
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
  'chat.suggestions.resume',
  'chat.suggestions.interview',
  'chat.suggestions.email',
  'chat.suggestions.budget',
  'chat.suggestions.invest',
  'chat.suggestions.save',
  'chat.suggestions.recipe',
  'chat.suggestions.mealprep',
  'chat.suggestions.workout',
  'chat.suggestions.weightloss',
  'chat.suggestions.sleep',
  'chat.suggestions.anxiety',
  'chat.suggestions.focus',
  'chat.suggestions.study',
  'chat.suggestions.language',
  'chat.suggestions.translate',
  'chat.suggestions.essay',
  'chat.suggestions.summarize',
  'chat.suggestions.code',
  'chat.suggestions.bug',
  'chat.suggestions.learnCode',
  'chat.suggestions.sql',
  'chat.suggestions.excel',
  'chat.suggestions.ai',
  'chat.suggestions.business',
  'chat.suggestions.marketing',
  'chat.suggestions.post',
  'chat.suggestions.gift',
  'chat.suggestions.party',
  'chat.suggestions.message',
  'chat.suggestions.relationship',
  'chat.suggestions.home',
  'chat.suggestions.plants',
  'chat.suggestions.pet',
  'chat.suggestions.movie',
  'chat.suggestions.book',
];
const SUGGESTIONS_SHOWN = 4;

function pickRandom<T>(items: readonly T[], count: number): T[] {
  const pool = [...items];
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(Math.random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

@Component({
  selector: 'app-chat-window',
  imports: [MatCardModule, MatButtonModule, MatIconModule, FormsModule, MarkdownPipe, BoltIcon, TranslocoPipe],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss',
})
export class ChatWindow {

  private transloco = inject(TranslocoService);
  private clipboard = inject(Clipboard);
  private chatContent = viewChild.required<ElementRef<HTMLDivElement>>('chatContent');

  title = input.required<string>();
  messages = input.required<ChatMessage[]>();
  isLoading = input(false);
  /** Translation key for the line under the welcome title. */
  welcomeHint = input('chat.welcome.hint');

  send = output<string>();

  userInput = signal('');

  copiedIndex = signal<number | null>(null);
  private copiedTimer: ReturnType<typeof setTimeout> | undefined;

  // Only the last reply can be retried, and only when there is a user message to resend.
  retryIndex = computed(() => {
    const messages = this.messages();
    const last = messages.length - 1;
    return last > 0 && messages[last].sender === 'bot' && messages.slice(0, last).some(m => m.sender === 'user') ? last : -1;
  });

  isEmpty = computed(() => this.messages().length === 0 && !this.isLoading());
  // Re-picked every time the welcome screen shows up again, e.g. after starting a new chat.
  suggestionKeys = computed(() => (this.isEmpty() ? pickRandom(SUGGESTION_KEYS, SUGGESTIONS_SHOWN) : []));

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

  copy(index: number) {
    if (!this.clipboard.copy(this.messages()[index].text)) return;
    this.copiedIndex.set(index);
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => this.copiedIndex.set(null), 2000);
  }

  retry(index: number) {
    const userMessage = this.messages().slice(0, index).filter(m => m.sender === 'user').at(-1);
    if (userMessage) {
      this.submit(userMessage.text);
    }
  }

  private submit(message: string) {
    if (message !== '' && !this.isLoading()) {
      this.send.emit(message);
      this.userInput.set('');
    }
  }
}
