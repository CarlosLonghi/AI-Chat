import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the brand and navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-name')?.textContent).toContain('ZeusAI');
    expect(compiled.querySelectorAll('.nav a').length).toBe(2);
  });

  it('should toggle the theme from the toolbar button', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('.theme-toggle') as HTMLButtonElement;

    expect(button.getAttribute('aria-label')).toBe('Switch to dark theme');
    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-label')).toBe('Switch to light theme');
  });
});
