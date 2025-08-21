import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('App', () => {
  let component: App;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App, RouterTestingModule]
    });
    
    const fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have title property', () => {
    expect(component['title']).toBeDefined();
  });

  it('should have title method that returns the title', () => {
    const title = component['title']();
    expect(typeof title).toBe('string');
    expect(title.length).toBeGreaterThan(0);
  });

  it('should render without errors', () => {
    const fixture = TestBed.createComponent(App);
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});