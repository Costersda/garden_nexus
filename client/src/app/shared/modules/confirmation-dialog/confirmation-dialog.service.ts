import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  constructor(private dialog: MatDialog) {}

  confirm(title: string, message: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { title, message },
      panelClass: 'custom-dialog-container'
    });

    return dialogRef.afterClosed().toPromise();
  }
}
