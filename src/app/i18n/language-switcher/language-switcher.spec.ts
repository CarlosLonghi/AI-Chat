import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageService } from '../language-service';
import { i18nTesting } from '../testing';
import { LanguageSwitcher } from './language-switcher';

describe('LanguageSwitcher', () => {
  let fixture: ComponentFixture<LanguageSwitcher>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LanguageSwitcher, i18nTesting],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSwitcher);
    await fixture.whenStable();
  });

  it('should show the current language and label the button', () => {
    const button = fixture.nativeElement.querySelector('.language-button') as HTMLButtonElement;
    expect(button.textContent).toContain('EN');
    expect(button.getAttribute('aria-label')).toBe('Language');
  });

  it('should switch language, persist it and update the document', async () => {
    const service = TestBed.inject(LanguageService);
    await service.use('pt');
    await fixture.whenStable();
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.language-button') as HTMLButtonElement;
    expect(button.textContent).toContain('PT');
    expect(button.getAttribute('aria-label')).toBe('Idioma');
    expect(localStorage.getItem('zeus-lang')).toBe('pt');
    expect(document.documentElement.lang).toBe('pt');
  });
});
