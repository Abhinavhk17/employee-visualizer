/**
 * Application Bootstrap
 * 
 * Entry point for the Angular application using standalone components.
 * Bootstraps the main App component with the configured providers.
 * 
 * This file:
 * - Imports the main App component (root component)
 * - Imports application configuration (providers, routing, etc.)
 * - Bootstraps the application and handles startup errors
 * 
 * Uses Angular's modern standalone architecture instead of NgModules
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Bootstrap the application with the root component and configuration
bootstrapApplication(App, appConfig)
  .catch((err) => console.error('Application startup error:', err));
