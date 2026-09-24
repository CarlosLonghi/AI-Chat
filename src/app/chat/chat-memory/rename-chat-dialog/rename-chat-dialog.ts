import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslocoPipe } from '@jsverse/transloco';

export const MAX_TITLE_LENGTH = 30;

function notBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim() === '' ? { blank: true } : null;
}

@Component({
  selector: 'app-rename-chat-dialog',
  imports: [ReactiveFormsModule, MatButtonModule, MatDialogModule, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rename-chat-dialog.html',
  styleUrl: './rename-chat-dialog.scss',
})
export class RenameChatDialog {

  private dialogRef = inject<MatDialogRef<RenameChatDialog, string>>(MatDialogRef);
  private currentTitle = inject<string>(MAT_DIALOG_DATA);

  readonly maxLength = MAX_TITLE_LENGTH;

  title = new FormControl(this.currentTitle.slice(0, MAX_TITLE_LENGTH), {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(MAX_TITLE_LENGTH), notBlank],
  });

  // Without a FormGroupDirective on the <form>, ngSubmit never fires and the browser submits natively (page reload).
  form = new FormGroup({ title: this.title });

  save() {
    if (this.title.valid) {
      this.dialogRef.close(this.title.value.trim());
    }
  }
}
