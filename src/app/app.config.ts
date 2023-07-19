import { ApplicationConfig } from '@angular/core';
import { provideQueryClient } from '@ng-query/ng-query';

export const appConfig: ApplicationConfig = {
  providers: [provideQueryClient()],
};
