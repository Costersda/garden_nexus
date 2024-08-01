import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent implements OnInit {
  countdown: number = 3;
  isConfirmDisabled: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {}

  ngOnInit(): void {
    this.startCountdown();
  }

  // Starts a 3-second countdown to enable the confirm button
  startCountdown(): void {
    const interval = setInterval(() => {
      this.countdown -= 1;
      if (this.countdown === 0) {
        clearInterval(interval);
        this.isConfirmDisabled = false;
      }
    }, 1000);
  }

  // Closes the dialog with true, indicating confirmation
  onConfirm(): void {
    this.dialogRef.close(true);
  }

  // Closes the dialog with false, indicating cancellation
  onCancel(): void {
    this.dialogRef.close(false);
  }
}