import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

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

  describe('rename and delete', () => {
    const chats = [
      { id: 'a', description: 'First' },
      { id: 'b', description: 'Second' },
    ];

    function answerDialog(result: unknown) {
      return vi.spyOn(TestBed.inject(MatDialog), 'open')
        .mockReturnValue({ afterClosed: () => of(result) } as never);
    }

    beforeEach(async () => {
      vi.spyOn(TestBed.inject(MatSnackBar), 'open').mockReturnValue(undefined as never);
      http.expectOne('/api/v1/chat/memory').flush(chats);
      fixture.componentRef.setInput('chatId', 'a');
      await fixture.whenStable();
      http.expectOne('/api/v1/chat/memory/a').flush([]);
    });

    it('should use the returned title in the list and the header', () => {
      answerDialog('Renamed');
      component.renameChat(chats[0]);

      const req = http.expectOne('/api/v1/chat/memory/a');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ description: 'Renamed' });
      req.flush({ id: 'a', description: 'Renamed by server' });

      expect(component.chats()[0].description).toBe('Renamed by server');
      expect(component.title()).toBe('Renamed by server');
    });

    it('should not call the API when rename is cancelled or unchanged', () => {
      answerDialog(undefined);
      component.renameChat(chats[0]);
      answerDialog('First');
      component.renameChat(chats[0]);
      http.verify();
    });

    it('should remove the chat and leave it when renaming a chat that no longer exists', () => {
      answerDialog('Renamed');
      component.renameChat(chats[0]);
      http.expectOne('/api/v1/chat/memory/a').flush({ status: 404 }, { status: 404, statusText: 'Not Found' });

      expect(component.chats().map(c => c.id)).toEqual(['b']);
      expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/chat-memory']);
    });

    it('should keep the list and warn on a validation error', () => {
      answerDialog('Renamed');
      component.renameChat(chats[0]);
      http.expectOne('/api/v1/chat/memory/a')
        .flush({ status: 400, detail: 'Invalid', errors: { description: 'too long' } }, { status: 400, statusText: 'Bad Request' });

      expect(component.chats()).toEqual(chats);
      expect(TestBed.inject(MatSnackBar).open).toHaveBeenCalledWith('too long', 'Close', expect.anything());
    });

    it('should delete the open chat and go back to a new chat', () => {
      answerDialog(true);
      component.deleteChat(chats[0]);

      const req = http.expectOne('/api/v1/chat/memory/a');
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });

      expect(component.chats().map(c => c.id)).toEqual(['b']);
      expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/chat-memory']);
    });

    it('should not navigate when deleting a chat that is not open', () => {
      answerDialog(true);
      component.deleteChat(chats[1]);
      http.expectOne('/api/v1/chat/memory/b').flush(null, { status: 204, statusText: 'No Content' });

      expect(component.chats().map(c => c.id)).toEqual(['a']);
      expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
    });

    it('should treat a 404 on delete as already deleted, without an error', () => {
      answerDialog(true);
      component.deleteChat(chats[1]);
      http.expectOne('/api/v1/chat/memory/b').flush({ status: 404 }, { status: 404, statusText: 'Not Found' });

      expect(component.chats().map(c => c.id)).toEqual(['a']);
      expect(TestBed.inject(MatSnackBar).open).not.toHaveBeenCalled();
    });

    it('should not delete when the confirmation is dismissed', () => {
      answerDialog(undefined);
      component.deleteChat(chats[0]);
      http.verify();
      expect(component.chats()).toEqual(chats);
    });
  });
});
