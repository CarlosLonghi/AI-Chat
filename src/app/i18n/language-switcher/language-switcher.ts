import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslocoPipe } from '@jsverse/transloco';
import { Language, LanguageService } from '../language-service';

@Component({
  selector: 'app-language-switcher',
  imports: [MatIconModule, MatMenuModule, TranslocoPipe],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
})
export class LanguageSwitcher {

  languageService = inject(LanguageService);

  select(lang: Language) {
    this.languageService.use(lang);
  }
}
