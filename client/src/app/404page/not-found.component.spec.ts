import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { data: {} }
    });

    await TestBed.configureTestingModule({
      declarations: [ NotFoundComponent ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize countdown to 5', () => {
    expect(component.countdown).toBe(5);
  });

  it('should decrease countdown every second', fakeAsync(() => {
    component.ngOnInit();
    tick(1000);
    expect(component.countdown).toBe(4);
    tick(1000);
    expect(component.countdown).toBe(3);
    discardPeriodicTasks();
  }));

  it('should redirect when countdown reaches 0', fakeAsync(() => {
    component.ngOnInit();
    tick(5000);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['']);
    discardPeriodicTasks();
  }));

  it('should use provided redirect path', fakeAsync(() => {
    activatedRouteSpy.snapshot.data['redirectTo'] = '/home';
    component.ngOnInit();
    tick(5000);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    discardPeriodicTasks();
  }));
});