import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { ChatMemory } from './chat-memory';

describe('ChatMemory', () => {
  let component: ChatMemory;
  let fixture: ComponentFixture<ChatMemory>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMemory],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(ChatMemory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create and load the chat list', () => {
    http.expectOne('/api/v1/chat/memory').flush([{ id: 'abc', description: 'Chat' }]);
    expect(component).toBeTruthy();
    expect(component.chats()).toEqual([{ id: 'abc', description: 'Chat' }]);
  });

  it('should create a new chat on first message', () => {
    http.expectOne('/api/v1/chat/memory').flush([]);
    component.sendMessage('oi');

    http.expectOne('/api/v1/chat/memory/new').flush({ chatId: 'abc', description: 'Título', response: 'olá' });

    expect(component.chats()).toEqual([{ id: 'abc', description: 'Título' }]);
    expect(component.messages().map(m => m.text)).toEqual(['Hello! How can I assist you today?', 'oi', 'olá']);
    expect(component.isLoading()).toBe(false);
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/chat-memory', 'abc']);
  });
});
