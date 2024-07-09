import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumPreviewComponent } from './forum-preview.component';

describe('ForumPreviewComponent', () => {
  let component: ForumPreviewComponent;
  let fixture: ComponentFixture<ForumPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForumPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForumPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
