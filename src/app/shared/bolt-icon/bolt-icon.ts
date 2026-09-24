import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-bolt-icon',
  templateUrl: './bolt-icon.html',
  styleUrl: './bolt-icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoltIcon {
  size = input(20);
}
