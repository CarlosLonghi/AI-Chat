import { TestBed } from '@angular/core/testing';

import { LanguageService } from './language-service';
import { i18nTesting } from './testing';

describe('LanguageService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [i18nTesting] });
  });

  it('should fall back to the browser language when nothing was saved', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('es-MX');
    const service = TestBed.inject(LanguageService);
    await service.init();
    expect(service.current()).toBe('es');
  });

  it('should prefer the saved language', async () => {
    localStorage.setItem('zeus-lang', 'pt');
    const service = TestBed.inject(LanguageService);
    await service.init();
    expect(service.current()).toBe('pt');
  });

  it('should ignore unsupported languages', async () => {
    localStorage.setItem('zeus-lang', 'fr');
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE');
    const service = TestBed.inject(LanguageService);
    await service.init();
    expect(service.current()).toBe('en');
  });
});
