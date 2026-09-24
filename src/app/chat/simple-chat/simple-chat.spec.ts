import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { enTranslations, i18nTesting } from '../../i18n/testing';
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
});
