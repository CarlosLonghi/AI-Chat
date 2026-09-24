import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LanguageSwitcher } from './i18n/language-switcher/language-switcher';
import { BoltIcon } from './shared/bolt-icon/bolt-icon';
import { ThemeService } from './theme/theme-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatToolbarModule, BoltIcon, LanguageSwitcher, TranslocoPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  readonly title = 'ZeusAI';

  themeService = inject(ThemeService);
}
