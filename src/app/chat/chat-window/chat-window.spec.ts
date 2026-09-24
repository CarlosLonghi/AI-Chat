import { Clipboard } from '@angular/cdk/clipboard';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { enTranslations, i18nTesting } from '../../i18n/testing';
import { ChatWindow } from './chat-window';

describe('ChatWindow', () => {
  let fixture: ComponentFixture<ChatWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ChatWindow, i18nTesting] }).compileComponents();
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

  it('should show the welcome screen with suggestions when there are no messages', async () => {
    fixture.componentRef.setInput('messages', []);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.welcome')).not.toBeNull();
    expect(el.querySelectorAll('.suggestion').length).toBe(4);
  });

  it('should show the memory hint on the welcome screen unless another one is given', async () => {
    fixture.componentRef.setInput('messages', []);
    await fixture.whenStable();
    const hint = () => (fixture.nativeElement as HTMLElement).querySelector('.welcome-hint')?.textContent;

    expect(hint()).toContain(enTranslations.chat.welcome.hint);

    fixture.componentRef.setInput('welcomeHint', 'chat.welcome.hintSimple');
    await fixture.whenStable();
    expect(hint()).toContain(enTranslations.chat.welcome.hintSimple);
  });

  it('should show 4 different suggestions picked from the whole pool', async () => {
    fixture.componentRef.setInput('messages', []);
    await fixture.whenStable();

    const pool = Object.values(enTranslations.chat.suggestions);
    expect(pool.length).toBe(40);
    const shown = Array.from(fixture.nativeElement.querySelectorAll('.suggestion') as NodeListOf<HTMLElement>).map(
      (b) => b.textContent?.replace('chat_bubble_outline', '').trim() ?? '',
    );
    expect(new Set(shown).size).toBe(4);
    shown.forEach((text) => expect(pool).toContain(text));
  });

  it('should send a suggestion when it is clicked', async () => {
    fixture.componentRef.setInput('messages', []);
    await fixture.whenStable();
    const sent: string[] = [];
    fixture.componentInstance.send.subscribe((text) => sent.push(text));

    (fixture.nativeElement.querySelector('.suggestion') as HTMLButtonElement).click();

    expect(sent.length).toBe(1);
    expect(Object.values(enTranslations.chat.suggestions)).toContain(sent[0]);
  });

  describe('reply actions', () => {
    const conversation = [
      { text: 'first question', sender: 'user' },
      { text: 'first **answer**', sender: 'bot' },
      { text: 'second question', sender: 'user' },
      { text: 'second answer', sender: 'bot' },
    ];

    it('should copy the raw text of a reply and confirm it', async () => {
      const clipboard = TestBed.inject(Clipboard);
      const copy = vi.spyOn(clipboard, 'copy').mockReturnValue(true);
      fixture.componentRef.setInput('messages', conversation);
      await fixture.whenStable();
      const el = fixture.nativeElement as HTMLElement;

      const buttons = el.querySelectorAll<HTMLButtonElement>('.action.copy');
      expect(buttons.length).toBe(2);
      buttons[0].click();
      await fixture.whenStable();

      expect(copy).toHaveBeenCalledWith('first **answer**');
      expect(el.querySelectorAll('.action.copy')[0].getAttribute('aria-label')).toBe(enTranslations.chat.copied);
      expect(el.querySelectorAll('.action.copy')[1].getAttribute('aria-label')).toBe(enTranslations.chat.copy);
    });

    it('should offer retry only on the last reply and resend the message before it', async () => {
      fixture.componentRef.setInput('messages', conversation);
      await fixture.whenStable();
      const el = fixture.nativeElement as HTMLElement;
      const sent: string[] = [];
      fixture.componentInstance.send.subscribe((text) => sent.push(text));

      const retry = el.querySelectorAll<HTMLButtonElement>('.action.retry');
      expect(retry.length).toBe(1);
      retry[0].click();

      expect(sent).toEqual(['second question']);
    });

    it('should not offer copy or retry on translated bot messages without a user message', async () => {
      fixture.componentRef.setInput('messages', [{ text: 'Hello', sender: 'bot', i18nKey: 'chat.welcome.title' }]);
      await fixture.whenStable();

      expect((fixture.nativeElement as HTMLElement).querySelector('.message-actions')).toBeNull();
    });

    it('should offer retry but not copy on an error reply', async () => {
      fixture.componentRef.setInput('messages', [
        { text: 'question', sender: 'user' },
        { text: 'Sorry', sender: 'bot', i18nKey: 'chat.error' },
      ]);
      await fixture.whenStable();
      const el = fixture.nativeElement as HTMLElement;

      expect(el.querySelector('.action.copy')).toBeNull();
      expect(el.querySelector('.action.retry')).not.toBeNull();
    });
  });

  it('should hide the welcome screen once there are messages or a response is loading', async () => {
    fixture.componentRef.setInput('messages', []);
    fixture.componentRef.setInput('isLoading', true);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.welcome')).toBeNull();
    expect(el.querySelector('.typing')).not.toBeNull();
  });
});
