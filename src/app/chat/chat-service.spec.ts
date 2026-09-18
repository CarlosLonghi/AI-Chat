import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ChatService } from './chat-service';

describe('ChatService', () => {
  let service: ChatService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ChatService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should post to the simple chat endpoint', () => {
    service.simpleChat('oi').subscribe();
    const req = http.expectOne('/api/v1/chat/simple');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ message: 'oi' });
  });

  it('should list chats', () => {
    service.getAllChats().subscribe();
    const req = http.expectOne('/api/v1/chat/memory');
    expect(req.request.method).toBe('GET');
  });

  it('should get chat history', () => {
    service.getChatMessages('abc').subscribe();
    const req = http.expectOne('/api/v1/chat/memory/abc');
    expect(req.request.method).toBe('GET');
  });

  it('should create a new chat', () => {
    service.newChat('oi').subscribe();
    const req = http.expectOne('/api/v1/chat/memory/new');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ message: 'oi' });
  });

  it('should continue an existing chat', () => {
    service.continueChat('abc', 'oi').subscribe();
    const req = http.expectOne('/api/v1/chat/memory/abc');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ message: 'oi' });
  });
});
