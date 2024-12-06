import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { VerifySuccessComponent } from './verify-success.component';
import { Component } from '@angular/core';

// Mock components
@Component({
    selector: 'app-toolbar', template: '',
    standalone: false
})
class MockToolbarComponent { }

@Component({
    selector: 'app-navbar', template: '',
    standalone: false
})
class MockNavbarComponent { }

@Component({
    selector: 'app-footer', template: '',
    standalone: false
})
class MockFooterComponent { }

describe('VerifySuccessComponent', () => {
  let component: VerifySuccessComponent;
  let fixture: ComponentFixture<VerifySuccessComponent>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create a mock Router object
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ 
        VerifySuccessComponent,
        MockToolbarComponent,
        MockNavbarComponent,
        MockFooterComponent
      ],
      providers: [
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifySuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to blogs page when goToBlogs is called', () => {
    component.goToBlogs();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/blogs']);
  });

  it('should navigate to forum page when goToForum is called', () => {
    component.goToForum();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/forum']);
  });

  it('should include toolbar, navbar, and footer components', () => {
    const toolbar = fixture.nativeElement.querySelector('app-toolbar');
    const navbar = fixture.nativeElement.querySelector('app-navbar');
    const footer = fixture.nativeElement.querySelector('app-footer');

    expect(toolbar).toBeTruthy();
    expect(navbar).toBeTruthy();
    expect(footer).toBeTruthy();
  });
});