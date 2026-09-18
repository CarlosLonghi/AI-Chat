import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatWindow } from './chat-window';

describe('ChatWindow', () => {
  let fixture: ComponentFixture<ChatWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ChatWindow] }).compileComponents();
    fixture = TestBed.createComponent(ChatWindow);
    fixture.componentRef.setInput('title', 'Test');
  });

  it('should render markdown for bot messages and sanitize scripts', async () => {
    fixture.componentRef.setInput('messages', [
      { text: '**bold** <script>alert(1)</script>', sender: 'bot' },
    ]);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.markdown strong')?.textContent).toBe('bold');
    expect(el.querySelector('script')).toBeNull();
  });

  it('should keep user messages as plain text', async () => {
    fixture.componentRef.setInput('messages', [{ text: '**not bold**', sender: 'user' }]);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('strong')).toBeNull();
    expect(el.querySelector('.message-bubble.user')?.textContent).toContain('**not bold**');
  });
});
