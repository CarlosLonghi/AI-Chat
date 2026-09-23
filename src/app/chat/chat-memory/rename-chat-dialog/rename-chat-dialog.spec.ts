import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { RenameChatDialog } from './rename-chat-dialog';

describe('RenameChatDialog', () => {
  let component: RenameChatDialog;
  let fixture: ComponentFixture<RenameChatDialog>;
  const close = vi.fn();

  beforeEach(async () => {
    close.mockClear();
    await TestBed.configureTestingModule({
      imports: [RenameChatDialog],
      providers: [
        { provide: MatDialogRef, useValue: { close } },
        { provide: MAT_DIALOG_DATA, useValue: 'Current' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RenameChatDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should start with the current title', () => {
    expect(component.title.value).toBe('Current');
  });

  it('should reject empty, blank and over-long titles', () => {
    for (const value of ['', '   ', 'x'.repeat(31)]) {
      component.title.setValue(value);
      expect(component.title.invalid).toBe(true);
      component.save();
    }
    expect(close).not.toHaveBeenCalled();
  });

  it('should close with the trimmed title', () => {
    component.title.setValue('  New title  ');
    component.save();
    expect(close).toHaveBeenCalledWith('New title');
  });

  it('should handle the form submit without a native page submit', () => {
    component.title.setValue('New title');
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    const event = new Event('submit', { cancelable: true });
    form.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(close).toHaveBeenCalledWith('New title');
  });
});
