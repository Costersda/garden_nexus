import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { ConfirmationDialogService } from './confirmation-dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmationDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [ ConfirmationDialogComponent ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { title: 'Test Title', message: 'Test Message' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with countdown at 3 and disabled confirm button', () => {
    expect(component.countdown).toBe(3);
    expect(component.isConfirmDisabled).toBeTrue();
  });

  it('should enable confirm button after 3 seconds', fakeAsync(() => {
    component.ngOnInit();
    expect(component.isConfirmDisabled).toBeTrue();

    tick(1000);
    expect(component.countdown).toBe(2);
    expect(component.isConfirmDisabled).toBeTrue();

    tick(1000);
    expect(component.countdown).toBe(1);
    expect(component.isConfirmDisabled).toBeTrue();

    tick(1000);
    expect(component.countdown).toBe(0);
    expect(component.isConfirmDisabled).toBeFalse();
  }));

  it('should close dialog with true on confirm', () => {
    component.onConfirm();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('should close dialog with false on cancel', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
  });
});

describe('ConfirmationDialogService', () => {
  let service: ConfirmationDialogService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      providers: [
        ConfirmationDialogService,
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });

    service = TestBed.inject(ConfirmationDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open dialog with correct configuration', async () => {
    const mockDialogRef = {
      afterClosed: () => of(true)
    };
    dialogSpy.open.and.returnValue(mockDialogRef as any);

    const result = await service.confirm('Test Title', 'Test Message');

    expect(dialogSpy.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
      width: '400px',
      data: { title: 'Test Title', message: 'Test Message' },
      panelClass: 'custom-dialog-container'
    });

    expect(result).toBeTrue();
  });
});