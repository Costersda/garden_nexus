import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { CreateBlogComponent } from './createBlog.component';
import { BlogService } from '../../../shared/services/blog.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Blog } from '../../../shared/types/blog.interface';
import { CurrentUserInterface } from '../../../auth/types/currentUser.interface';
import { Component } from '@angular/core';

// Mock components
@Component({
    selector: 'app-toolbar', template: '',
    standalone: false
})
class MockToolbarComponent { }

@Component({
    selector: 'app-navbar', template: '',
    standalone: false
})
class MockNavbarComponent { }

@Component({
    selector: 'app-footer', template: '',
    standalone: false
})
class MockFooterComponent { }

describe('CreateBlogComponent', () => {
    let component: CreateBlogComponent;
    let fixture: ComponentFixture<CreateBlogComponent>;
    let blogServiceSpy: jasmine.SpyObj<BlogService>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;

    beforeEach(async () => {
        const blogSpy = jasmine.createSpyObj('BlogService', ['createBlog']);
        const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, FormsModule],
            declarations: [CreateBlogComponent,
                MockToolbarComponent,
                MockNavbarComponent,
                MockFooterComponent,
            ],
            providers: [
                { provide: BlogService, useValue: blogSpy },
                { provide: AuthService, useValue: authSpy }
            ]
        }).compileComponents();

        blogServiceSpy = TestBed.inject(BlogService) as jasmine.SpyObj<BlogService>;
        authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateBlogComponent);
        component = fixture.componentInstance;
        authServiceSpy.getCurrentUser.and.returnValue(of({
            id: 'testUserId',
            token: 'testToken',
            username: 'testUser',
            email: 'test@example.com',
            isVerified: true
        } as CurrentUserInterface));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize blog with empty fields', () => {
        expect(component.blog).toBeDefined();
        expect(component.blog.title).toBe('');
        expect(component.blog.content_section_1).toBe('');
        expect(component.blog.categories).toEqual([]);
    });

    it('should set user_id on initialization', () => {
        expect(component.blog.user_id).toBe('testUserId');
    });

    it('should toggle category selection', () => {
        component.toggleCategory('Technology');
        expect(component.blog.categories).toContain('Technology');

        component.toggleCategory('Technology');
        expect(component.blog.categories).not.toContain('Technology');
    });

    it('should validate file size', () => {
        const event = {
            target: {
                files: [{ size: 3 * 1024 * 1024, type: 'image/jpeg' }]
            }
        };
        component.onFileChange(event, 'image_1');
        expect(component.fileSizeError['image_1']).toBe('File size exceeds 2 MB');
        expect(component.imageErrors['image_1']).toBeTrue();
    });

    it('should validate file type', () => {
        const event = {
            target: {
                files: [{ size: 1 * 1024 * 1024, type: 'image/gif' }]
            }
        };
        component.onFileChange(event, 'image_1');
        expect(component.fileTypeError['image_1']).toBe('Invalid file type. Only JPEG and PNG are allowed');
        expect(component.imageErrors['image_1']).toBeTrue();
    });

    it('should count words correctly', () => {
        expect(component.countWords('This is a test')).toBe(4);
        expect(component.countWords('   Extra   spaces   ')).toBe(2);
        expect(component.countWords('Toolongwordthatwillbecounted')).toBe(1);
        expect(component.countWords('   ')).toBe(0);
        expect(component.countWords('')).toBe(0);
      });

    it('should validate title length', () => {
        component.blog.title = 'a'.repeat(101);
        expect(component.isTitleTooLong()).toBeTrue();

        component.blog.title = 'Short title';
        expect(component.isTitleTooLong()).toBeFalse();
    });

    it('should validate content length', () => {
        component.blog.content_section_1 = 'Short content';
        expect(component.isContentTooShort('content_section_1')).toBeTrue();
        expect(component.isContentTooLong('content_section_1')).toBeFalse();

        component.blog.content_section_1 = 'a '.repeat(1001);
        expect(component.isContentTooShort('content_section_1')).toBeFalse();
        expect(component.isContentTooLong('content_section_1')).toBeTrue();
    });

    it('should validate content for word length', () => {
        component.blog.content_section_1 = 'Valid content';
        expect(component.isContentValid('content_section_1')).toBeTrue();

        component.blog.content_section_1 = 'Invalid ' + 'a'.repeat(51) + ' content';
        expect(component.isContentValid('content_section_1')).toBeFalse();
    });

    it('should create blog when form is valid', () => {
        const testBlog: Blog = {
            user_id: 'testUserId',
            title: 'Test Blog',
            content_section_1: 'a '.repeat(200),
            image_1: 'data:image/png;base64,testimage',
            categories: ['Technology'],
            comments: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        component.blog = { ...testBlog };
        blogServiceSpy.createBlog.and.returnValue(of(testBlog));

        component.createBlog();

        expect(blogServiceSpy.createBlog).toHaveBeenCalledWith(component.blog);
    });

    it('should not create blog when form is invalid', () => {
        component.blog.title = '';
        component.createBlog();
        expect(blogServiceSpy.createBlog).not.toHaveBeenCalled();
    });

    it('should handle error when creating blog', () => {
        const testBlog: Blog = {
            user_id: 'testUserId',
            title: 'Test Blog',
            content_section_1: 'a '.repeat(200),
            image_1: 'data:image/png;base64,testimage',
            categories: ['Technology'],
            comments: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        component.blog = { ...testBlog };
        blogServiceSpy.createBlog.and.returnValue(throwError('Error'));
        spyOn(console, 'error');

        component.createBlog();

        expect(console.error).toHaveBeenCalledWith('Error creating blog:', 'Error');
    });
});