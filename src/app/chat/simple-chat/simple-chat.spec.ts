import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { enTranslations, i18nTesting } from '../../i18n/testing';
import { QUICK_SUGGESTION_KEYS } from './quick-suggestions';
import { SimpleChat } from './simple-chat';

describe('SimpleChat', () => {
  let component: SimpleChat;
  let fixture: ComponentFixture<SimpleChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleChat, i18nTesting],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SimpleChat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open on the welcome screen saying each message is independent', () => {
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.welcome')).not.toBeNull();
    expect(el.querySelector('.welcome-hint')?.textContent).toContain(enTranslations.chat.welcome.hintSimple);
    expect(el.querySelector('.message')).toBeNull();
  });

  it('should suggest only quick questions, drawn from the 20 written for this chat', () => {
    const quick = Object.values(enTranslations.chat.quickSuggestions);
    expect(QUICK_SUGGESTION_KEYS.length).toBe(20);
    expect(quick.length).toBe(20);

    const el = fixture.nativeElement as HTMLElement;
    const shown = Array.from(el.querySelectorAll<HTMLElement>('.suggestion')).map(
      (b) => b.textContent?.replace('chat_bubble_outline', '').trim() ?? '',
    );
    expect(shown.length).toBe(4);
    shown.forEach((text) => expect(quick).toContain(text));
  });

  describe('asking questions', () => {
    let http: HttpTestingController;
    const el = () => fixture.nativeElement as HTMLElement;
    const placeholder = () => el().querySelector('input')?.getAttribute('placeholder');

    async function ask(question: string, answer: string) {
      component.sendMessage(question);
      http.expectOne('/api/v1/chat/simple').flush({ message: answer });
      await fixture.whenStable();
    }

    beforeEach(() => {
      http = TestBed.inject(HttpTestingController);
    });

    it('should ask for a new question once one was answered', async () => {
      expect(placeholder()).toBe(enTranslations.chat.placeholder);

      await ask('first question', 'first answer');

      expect(placeholder()).toBe(enTranslations.chat.placeholderNew);
    });

    it('should clear the previous question and answer when a new question is sent', async () => {
      await ask('first question', 'first answer');
      expect(el().textContent).toContain('first answer');

      await ask('second question', 'second answer');

      const text = el().textContent;
      expect(text).toContain('second question');
      expect(text).toContain('second answer');
      expect(text).not.toContain('first question');
      expect(text).not.toContain('first answer');
      expect(el().querySelectorAll('.message').length).toBe(2);
    });
  });
});
