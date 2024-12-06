import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'app-terms-of-service-modal',
    templateUrl: './termsOfServiceModal.component.html',
    standalone: false
})
export class TermsOfServiceModalComponent {
  // Event emitters for modal actions
  @Output() close = new EventEmitter<void>();
  @Output() agree = new EventEmitter<void>();

  // Reference to the modal background element
  @ViewChild('modalBackground') modalBackground!: ElementRef;

  // Close modal when clicking outside the content area
  onModalBackgroundClick(event: MouseEvent): void {
    if (event.target === this.modalBackground.nativeElement) {
      this.closeModal();
    }
  }

  // Emit close event
  closeModal(): void {
    this.close.emit();
  }

  // Emit agree event and close modal
  agreeToTerms(): void {
    this.agree.emit();
    this.closeModal();
  }
}