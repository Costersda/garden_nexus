import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TermsOfServiceModalComponent } from './termsOfServiceModal.component';
import { By } from '@angular/platform-browser';

describe('TermsOfServiceModalComponent', () => {
  let component: TermsOfServiceModalComponent;
  let fixture: ComponentFixture<TermsOfServiceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TermsOfServiceModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsOfServiceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close event when closeModal is called', () => {
    spyOn(component.close, 'emit');
    component.closeModal();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should emit agree event and close modal when agreeToTerms is called', () => {
    spyOn(component.agree, 'emit');
    spyOn(component, 'closeModal');
    component.agreeToTerms();
    expect(component.agree.emit).toHaveBeenCalled();
    expect(component.closeModal).toHaveBeenCalled();
  });

  it('should close modal when clicking on modal background', () => {
    spyOn(component, 'closeModal');
    const modalBackground = fixture.debugElement.query(By.css('.modal')).nativeElement;
    const mockEvent = new MouseEvent('click');
    Object.defineProperty(mockEvent, 'target', { value: modalBackground });
    component.onModalBackgroundClick(mockEvent);
    expect(component.closeModal).toHaveBeenCalled();
  });

  it('should not close modal when clicking inside modal content', () => {
    spyOn(component, 'closeModal');
    const modalContent = fixture.debugElement.query(By.css('.modal-content')).nativeElement;
    const mockEvent = new MouseEvent('click');
    Object.defineProperty(mockEvent, 'target', { value: modalContent });
    component.onModalBackgroundClick(mockEvent);
    expect(component.closeModal).not.toHaveBeenCalled();
  });
});
