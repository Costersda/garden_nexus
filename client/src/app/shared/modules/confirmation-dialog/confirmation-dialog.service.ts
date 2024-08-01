import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  constructor(private dialog: MatDialog) {}

  // Opens a confirmation dialog and returns a Promise resolving to the user's choice
  confirm(title: string, message: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { title, message },
      panelClass: 'custom-dialog-container'
    });

    // Convert the Observable to a Promise for easier consumption
    return dialogRef.afterClosed().toPromise();
  }
}