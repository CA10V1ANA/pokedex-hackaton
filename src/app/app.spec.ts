import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { App } from './app';

describe('App', () => {
  it('should instantiate the root application component', () => {
    const app = new App();
    expect(app).toBeDefined();
  });
});
