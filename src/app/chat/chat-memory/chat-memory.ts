import { BreakpointObserver } from '@angular/cdk/layout';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { map } from 'rxjs';
import { BoltIcon } from '../../shared/bolt-icon/bolt-icon';
import { ChatHistoryResponse, ChatMessage, ChatProblemDetail, ChatSummaryResponse } from '../chat-models';
import { ChatService } from '../chat-service';
import { ChatWindow } from '../chat-window/chat-window';
import { DeleteChatDialog } from './delete-chat-dialog/delete-chat-dialog';
import { RenameChatDialog } from './rename-chat-dialog/rename-chat-dialog';

const ERROR_MESSAGE: ChatMessage = {
  text: 'Sorry, something went wrong. Please try again.',
  sender: 'bot',
  i18nKey: 'chat.error',
};

@Component({
  selector: 'app-chat-memory',
  imports: [ChatWindow, BoltIcon, MatButtonModule, MatIconModule, MatMenuModule, MatSidenavModule, RouterLink, RouterLinkActive, TranslocoPipe],
  templateUrl: './chat-memory.html',
  styleUrl: './chat-memory.scss',
})
export class ChatMemory {

  private chatService = inject(ChatService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private transloco = inject(TranslocoService);

  isMobile = toSignal(
    inject(BreakpointObserver).observe('(max-width: 768px)').pipe(map(state => state.matches)),
    { initialValue: false },
  );

  chatId = input<string>();

  chats = signal<ChatSummaryResponse[]>([]);
  chatsLoaded = signal(false);
  title = computed(() => this.chats().find(c => c.id === this.chatId())?.description);
  messages = signal<ChatMessage[]>([]);
  isLoading = signal(false);
  drawerOpen = signal(false);

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

  closeDrawer() {
    this.drawerOpen.set(false);
  }

  renameChat(chat: ChatSummaryResponse) {
    this.dialog
      .open<RenameChatDialog, string, string>(RenameChatDialog, { data: chat.description, width: '400px' })
      .afterClosed()
      .subscribe(description => {
        if (description === undefined || description === chat.description) return;

        this.chatService.updateChatDescription(chat.id, description).subscribe({
          next: saved => this.chats.update(chats =>
            chats.map(c => (c.id === saved.id ? { ...c, description: saved.description } : c))),
          error: (err) => {
            if (err instanceof HttpErrorResponse && err.status === 404) {
              this.removeChat(chat.id);
              this.notify(this.transloco.translate('memory.gone'));
              return;
            }
            console.error('Error renaming chat:', err);
            this.notify(this.errorMessage(err, 'memory.renameFailed'));
          },
        });
      });
  }

  deleteChat(chat: ChatSummaryResponse) {
    this.dialog
      .open<DeleteChatDialog, string, boolean>(DeleteChatDialog, { data: chat.description, width: '400px' })
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) return;

        this.chatService.deleteChat(chat.id).subscribe({
          next: () => {
            this.removeChat(chat.id);
            this.notify(this.transloco.translate('memory.deleted'));
          },
          error: (err) => {
            // Already gone (e.g. deleted in another tab): same outcome the user asked for.
            if (err instanceof HttpErrorResponse && err.status === 404) {
              this.removeChat(chat.id);
              return;
            }
            console.error('Error deleting chat:', err);
            this.notify(this.errorMessage(err, 'memory.deleteFailed'));
          },
        });
      });
  }

  private removeChat(chatId: string) {
    this.chats.update(chats => chats.filter(c => c.id !== chatId));
    if (this.chatId() === chatId) {
      this.router.navigate(['/chat-memory']);
    }
  }

  private notify(message: string) {
    this.snackBar.open(message, this.transloco.translate('memory.close'), { duration: 5000 });
  }

  private errorMessage(err: unknown, fallbackKey: string): string {
    const problem = err instanceof HttpErrorResponse ? (err.error as ChatProblemDetail | null) : null;
    return problem?.errors?.['description'] ?? problem?.detail ?? this.transloco.translate(fallbackKey);
  }

  private loadChats() {
    this.chatService.getAllChats().subscribe({
      next: (chats) => {
        this.chats.set(chats);
        this.chatsLoaded.set(true);
      },
      error: (err) => {
        console.error('Error loading chats:', err);
        this.chatsLoaded.set(true);
      },
    });
  }

  private openChat(chatId: string | undefined) {
    if (chatId === this.activeChatId) {
      return;
    }
    this.activeChatId = chatId;

    if (!chatId) {
      this.messages.set([]);
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
