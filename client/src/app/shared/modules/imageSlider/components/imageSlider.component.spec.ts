import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { ImageSliderComponent } from './imageSlider.component';
import { SlideInterface } from '../../types/slide.interface';

describe('ImageSliderComponent', () => {
  let component: ImageSliderComponent;
  let fixture: ComponentFixture<ImageSliderComponent>;

  const mockSlides: SlideInterface[] = [
    { url: 'url1', title: 'Image 1' },
    { url: 'url2', title: 'Image 2' },
    { url: 'url3', title: 'Image 3' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageSliderComponent ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageSliderComponent);
    component = fixture.componentInstance;
    component.slides = mockSlides;
    component.autoSlideInterval = 1000; // Set to 1 second for testing
    fixture.detectChanges();
  });

  afterEach(() => {
    component.clearTimer();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with the first slide', () => {
    expect(component.currentIndex).toBe(0);
  });

  it('should go to the next slide', () => {
    component.goToNext();
    expect(component.currentIndex).toBe(1);
  });

  it('should go to the first slide when on the last slide and going next', () => {
    component.currentIndex = 2;
    component.goToNext();
    expect(component.currentIndex).toBe(0);
  });

  it('should go to the previous slide', () => {
    component.currentIndex = 1;
    component.goToPrevious();
    expect(component.currentIndex).toBe(0);
  });

  it('should go to the last slide when on the first slide and going previous', () => {
    component.goToPrevious();
    expect(component.currentIndex).toBe(2);
  });

  it('should go to a specific slide', () => {
    component.goToSlide(1);
    expect(component.currentIndex).toBe(1);
  });

  it('should get the current slide URL', () => {
    expect(component.getCurrentSlideUrl()).toBe("url('url1')");
  });

  it('should reset the timer when changing slides', fakeAsync(() => {
    spyOn(window, 'setTimeout').and.callThrough();
    component.resetTimer();
    expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 1000);
    
    component.clearTimer();
    tick(1000);
  }));

  it('should clear the timeout on component destruction', fakeAsync(() => {
    spyOn(window, 'clearTimeout').and.callThrough();
    component.ngOnInit();
    component.ngOnDestroy();
    expect(window.clearTimeout).toHaveBeenCalled();
    tick(1000);
  }));

  it('should automatically go to next slide after set interval', fakeAsync(() => {
    component.ngOnInit();
    expect(component.currentIndex).toBe(0);
    tick(1000);
    expect(component.currentIndex).toBe(1);
    tick(1000);
    expect(component.currentIndex).toBe(2);
    tick(1000);
    expect(component.currentIndex).toBe(0);

    component.ngOnDestroy();
    tick(1000);
    discardPeriodicTasks();
  }));
});
