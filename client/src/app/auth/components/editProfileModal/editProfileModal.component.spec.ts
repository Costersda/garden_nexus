import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EditProfileModalComponent } from './editProfileModal.component';
import { CountryService } from '../../../shared/services/country.service';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('EditProfileModalComponent', () => {
  let component: EditProfileModalComponent;
  let fixture: ComponentFixture<EditProfileModalComponent>;
  let httpMock: HttpTestingController;
  let countryServiceSpy: jasmine.SpyObj<CountryService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('CountryService', ['getCountries']);

    await TestBed.configureTestingModule({
      declarations: [ EditProfileModalComponent ],
      imports: [ HttpClientTestingModule, FormsModule ],
      providers: [
        { provide: CountryService, useValue: spy }
      ],
      schemas: [ NO_ERRORS_SCHEMA ] // This will ignore unknown properties/elements
    }).compileComponents();

    countryServiceSpy = TestBed.inject(CountryService) as jasmine.SpyObj<CountryService>;
    countryServiceSpy.getCountries.and.returnValue(['USA', 'Canada', 'UK']);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProfileModalComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize countries', () => {
    expect(component.countries).toEqual(['USA', 'Canada', 'UK']);
    expect(countryServiceSpy.getCountries).toHaveBeenCalled();
  });

  it('should update profile on ngOnChanges', () => {
    const profile = { username: 'testuser', email: 'test@example.com', country: 'USA', bio: 'Test bio' };
    component.profile = profile;
    component.ngOnChanges();
    expect(component.updatedProfile).toEqual({ country: 'USA', bio: 'Test bio', imageFile: undefined });
    expect(component.wordCount).toBe(2);
  });

  it('should count words correctly', () => {
    component.updatedProfile.bio = 'This is a test bio';
    component.checkWordCount();
    expect(component.wordCount).toBe(5);
  });

  it('should save profile', fakeAsync(() => {
    const profile = { username: 'testuser', email: 'test@example.com' };
    const updatedProfile = { country: 'USA', bio: 'Updated bio' };
    component.profile = profile;
    component.updatedProfile = updatedProfile;

    let profileUpdated = false;
    component.profileUpdated.subscribe(() => profileUpdated = true);

    let closed = false;
    component.close.subscribe(() => closed = true);

    component.saveProfile();

    const req = httpMock.expectOne(`${environment.apiUrl}/profile/testuser`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedProfile);
    req.flush({});

    tick();

    expect(profileUpdated).toBe(true);
    expect(closed).toBe(true);
  }));

  it('should handle file change correctly for valid image', (done) => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file] } };

    component.onFileChange(event);

    setTimeout(() => {
      expect(component.fileSizeError).toBeNull();
      expect(component.fileTypeError).toBeNull();
      expect(component.updatedProfile.imageFile).toBeDefined();
      done();
    }, 100);
  });

  it('should handle file change for invalid file type', () => {
    const file = new File([''], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [file] } };

    component.onFileChange(event);

    expect(component.fileTypeError).toBe('Invalid file type. Please upload a JPEG, PNG, JPG, or WEBP image.');
    expect(component.fileSizeError).toBeNull();
    expect(component.updatedProfile.imageFile).toBeUndefined();
  });

  it('should handle file change for oversized file', () => {
    const file = new File([''], 'large.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 }); // 3MB
    const event = { target: { files: [file] } };

    component.onFileChange(event);

    expect(component.fileSizeError).toBe('File size exceeds 2 MB limit.');
    expect(component.fileTypeError).toBeNull();
    expect(component.updatedProfile.imageFile).toBeUndefined();
  });

  it('should emit close event on cancel', () => {
    let closed = false;
    component.close.subscribe(() => closed = true);

    component.cancel();

    expect(closed).toBe(true);
  });

  it('should emit close event on modal background click', () => {
    let closed = false;
    component.close.subscribe(() => closed = true);

    // Mock the ElementRef
    component.modalBackground = { nativeElement: {} } as any;

    const mockEvent = { target: component.modalBackground.nativeElement } as MouseEvent;
    component.onModalBackgroundClick(mockEvent);

    expect(closed).toBe(true);
  });
});