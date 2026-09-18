import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'simple-chat',
    pathMatch: 'full'
  },
  {
    path: 'simple-chat',
    loadComponent: () => import('./chat/simple-chat/simple-chat')
      .then(c => c.SimpleChat)
  },
  {
    path: 'chat-memory',
    loadComponent: () => import('./chat/chat-memory/chat-memory')
      .then(c => c.ChatMemory)
  },
  {
    path: 'chat-memory/:chatId',
    loadComponent: () => import('./chat/chat-memory/chat-memory')
      .then(c => c.ChatMemory)
  },
  {
    path: '**',
    redirectTo: 'simple-chat'
  }
];
