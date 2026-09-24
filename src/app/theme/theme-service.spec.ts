import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme-service';

describe('ThemeService', () => {
  const root = document.documentElement;

  beforeEach(() => {
    localStorage.clear();
    delete root.dataset['theme'];
  });

  it('should follow the system when nothing was chosen', () => {
    const service = TestBed.inject(ThemeService);
    TestBed.tick();

    expect(service.theme()).toBe('light');
    expect(root.dataset['theme']).toBeUndefined();
  });

  it('should toggle, apply and persist the choice', () => {
    const service = TestBed.inject(ThemeService);

    service.toggle();
    TestBed.tick();
    expect(service.theme()).toBe('dark');
    expect(root.dataset['theme']).toBe('dark');
    expect(localStorage.getItem('zeus-theme')).toBe('dark');

    service.toggle();
    TestBed.tick();
    expect(service.theme()).toBe('light');
    expect(root.dataset['theme']).toBe('light');
  });

  it('should restore a saved theme', () => {
    localStorage.setItem('zeus-theme', 'dark');
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('dark');
  });
});
