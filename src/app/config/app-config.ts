import { InjectionToken } from '@angular/core';

export const BASE_URL = new InjectionToken<string>('BaseUrl', {
  providedIn: 'root',
  factory: () => 'http://localhost:5000/api/',  // URL par défaut
});
