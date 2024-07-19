import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-terms-of-service-modal',
  templateUrl: './termsOfServiceModal.component.html',
})
export class TermsOfServiceModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() agree = new EventEmitter<void>();
  @ViewChild('modalBackground') modalBackground!: ElementRef;

  onModalBackgroundClick(event: MouseEvent): void {
    if (event.target === this.modalBackground.nativeElement) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  agreeToTerms(): void {
    this.agree.emit();
    this.closeModal();
  }
}