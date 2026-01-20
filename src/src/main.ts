import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideStore } from '@ngrx/store';
import { ideaReducer } from './app/store/idea.reducer';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { IdeaEffects } from './app/store/idea.effects';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { MasterDataEffects } from './app/store/masterData/masterData.effects';
import { masterDataReducer } from './app/store/masterData/masterData.reducer';


bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    provideHttpClient(),
    provideStore({ ideas: ideaReducer, masterData: masterDataReducer }),
    provideEffects([IdeaEffects, MasterDataEffects]),
    provideStoreDevtools({ maxAge: 25 }),
    provideAnimations()
  ],
})
  .then(() => console.log('✅ Angular app bootstrapped'))
  .catch((err) => console.error('❌ Bootstrap error:', err));