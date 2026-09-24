import { TranslocoTestingModule } from '@jsverse/transloco';

import en from '../../../public/i18n/en.json';
import es from '../../../public/i18n/es.json';
import pt from '../../../public/i18n/pt.json';

export { en as enTranslations };

/** Real translation files, so specs assert against the same strings users see. */
export const i18nTesting = TranslocoTestingModule.forRoot({
  langs: { en, pt, es },
  translocoConfig: { availableLangs: ['pt', 'en', 'es'], defaultLang: 'en', reRenderOnLangChange: true },
  preloadLangs: true,
});
