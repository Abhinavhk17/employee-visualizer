/**
 * Application Configuration
 * 
 * This file configures the Angular application with necessary providers for:
 * - Zone.js change detection with event coalescing for better performance
 * - Router functionality for navigation (currently minimal)
 * - HTTP client for API calls to fetch employee data
 * - Global error handling for production error tracking
 * 
 * Uses Angular's standalone components architecture (no NgModules required)
 */

import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Global error handling for production environments
    provideBrowserGlobalErrorListeners(),
    
    // Zone.js configuration with event coalescing for better performance
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // Router configuration (currently minimal for single-page app)
    provideRouter(routes),
    
    // HTTP client for API calls to fetch employee time data
    provideHttpClient()
  ]
};
