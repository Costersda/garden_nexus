import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { CreateForumComponent } from '../createForum/createForum.component';
import { ForumService } from '../../../shared/services/forum.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Category, CATEGORIES } from '../../../shared/types/category.interface';
import { Router } from '@angular/router';
import { Component, Input } from '@angular/core';
import { Forum } from '../../../shared/types/forum.interface';

// Mock components
@Component({ selector: 'app-toolbar', template: '' })
class MockToolbarComponent { }

@Component({ selector: 'app-navbar', template: '' })
class MockNavbarComponent { }

@Component({ selector: 'app-footer', template: '' })
class MockFooterComponent { }

@Component({ selector: 'app-forum-preview', template: '' })
class MockForumPreviewComponent {
  @Input() forum!: Forum;
}

describe('CreateForumComponent', () => {
    let component: CreateForumComponent;
    let fixture: ComponentFixture<CreateForumComponent>;
    let forumServiceSpy: jasmine.SpyObj<ForumService>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        const forumSpy = jasmine.createSpyObj('ForumService', ['createForum']);
        const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
        const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [
                CreateForumComponent,
                MockToolbarComponent,
                MockNavbarComponent,
                MockFooterComponent,
                MockForumPreviewComponent
            ],
            imports: [RouterTestingModule, FormsModule],
            providers: [
                { provide: ForumService, useValue: forumSpy },
                { provide: AuthService, useValue: authSpy },
                { provide: Router, useValue: routerSpyObj }
            ]
        }).compileComponents();

        forumServiceSpy = TestBed.inject(ForumService) as jasmine.SpyObj<ForumService>;
        authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateForumComponent);
        component = fixture.componentInstance;
        authServiceSpy.getCurrentUser.and.returnValue(of({
            id: '456',
            token: 'some-token',
            username: 'testuser',
            email: 'test@example.com',
            isVerified: true
        }));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize forum with empty values', () => {
        expect(component.forum).toEqual({
            user_id: '456',
            title: '',
            content: '',
            categories: [],
            comments: [],
            createdAt: jasmine.any(Date),
            updatedAt: jasmine.any(Date)
        });
    });

    it('should toggle category correctly', () => {
        component.toggleCategory('Technology');
        expect(component.forum.categories).toContain('Technology');

        component.toggleCategory('Technology');
        expect(component.forum.categories).not.toContain('Technology');
    });

    it('should calculate title word count correctly', () => {
        component.forum.title = 'This is a test title';
        expect(component.getTitleWordCount()).toBe(5);
    });

    it('should calculate content word count correctly', () => {
        component.forum.content = 'This is some test content for the forum post.';
        expect(component.getContentWordCount()).toBe(9);
    });

    it('should not create forum if validation fails', () => {
        component.forum.title = 'Test';
        component.forum.content = 'Short content';
        component.createForum();
        expect(forumServiceSpy.createForum).not.toHaveBeenCalled();
    });

    it('should create forum and navigate on success', fakeAsync(() => {
        component.forum.title = 'Valid Title';
        component.forum.content = 'This is a valid content with more than 200 characters. '.repeat(5);
        forumServiceSpy.createForum.and.returnValue(of({
            user_id: 'user123',
            title: 'Sample Forum Title',
            content: 'This is a sample content for the forum.',
            categories: ['Category1', 'Category2'],
            createdAt: new Date(),
            updatedAt: new Date(),
            comments: []
        }));

        component.createForum();
        tick();

        expect(forumServiceSpy.createForum).toHaveBeenCalledWith(component.forum);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/forum'], { replaceUrl: true });
    }));

    it('should handle error when creating forum', fakeAsync(() => {
        component.forum.title = 'Valid Title';
        component.forum.content = 'This is a valid content with more than 200 characters. '.repeat(5);
        forumServiceSpy.createForum.and.returnValue(throwError('Error'));

        spyOn(console, 'error');
        component.createForum();
        tick();

        expect(forumServiceSpy.createForum).toHaveBeenCalledWith(component.forum);
        expect(console.error).toHaveBeenCalledWith('Error creating forum:', 'Error');
    }));

    it('should set user_id when component initializes', fakeAsync(() => {
        authServiceSpy.getCurrentUser.and.returnValue(of({
            id: '456',
            token: 'sampleToken',
            username: 'sampleUser',
            email: 'user@example.com',
            isVerified: true
        }));
        
        component.ngOnInit();
        tick();
        expect(component.forum.user_id).toBe('456');
    }));

    it('should handle error when fetching current user', fakeAsync(() => {
        authServiceSpy.getCurrentUser.and.returnValue(throwError('User error'));
        spyOn(console, 'error');
        component.ngOnInit();
        tick();
        expect(console.error).toHaveBeenCalledWith('Error fetching current user:', 'User error');
    }));
});