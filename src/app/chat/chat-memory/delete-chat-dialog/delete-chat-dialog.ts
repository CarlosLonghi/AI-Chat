import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-delete-chat-dialog',
  imports: [MatButtonModule, MatDialogModule, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './delete-chat-dialog.html',
  styleUrl: './delete-chat-dialog.scss',
})
export class DeleteChatDialog {
  title = inject<string>(MAT_DIALOG_DATA);
}
