import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BlogPreviewComponent } from './blog-preview.component';
import { UserService } from '../../services/user.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';

describe('BlogPreviewComponent', () => {
    let component: BlogPreviewComponent;
    let fixture: ComponentFixture<BlogPreviewComponent>;
    let userServiceSpy: jasmine.SpyObj<UserService>;
    let router: Router;

    beforeEach(async () => {
        userServiceSpy = jasmine.createSpyObj('UserService', ['getUserById']);

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, BlogPreviewComponent],
            providers: [
                { provide: UserService, useValue: userServiceSpy }
            ]
        }).compileComponents();

        router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        fixture = TestBed.createComponent(BlogPreviewComponent);
        component = fixture.componentInstance;

        // Set up default blog object
        component.blog = {
            _id: '1',
            title: 'Test Blog',
            user_id: '123',
            content_section_1: 'This is a test blog post with more than fifteen words to ensure the preview works correctly.',
            image_1: 'image-url-1',
            categories: ['category1'],
            comments: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch blog author username on init', () => {
        userServiceSpy.getUserById.and.returnValue(of({
            _id: '123',
            id: '123',
            email: 'testuser@example.com',
            username: 'testuser',
            bio: 'A brief bio',
            imageFile: 'profile-pic-url',
            isVerified: true,
            following: [],
            followers: []
        }));

        component.ngOnInit();
        expect(userServiceSpy.getUserById).toHaveBeenCalledWith('123');
        expect(component.blogAuthor).toBe('testuser');
    });

    it('should navigate to blog with "blog" source', () => {
        component.source = 'blog';
        component.viewBlog('1');
        expect(router.navigate).toHaveBeenCalledWith(['/blog', '1'], { queryParams: { source: 'blog' } });
    });

    it('should navigate to blog with "profile" source and username', () => {
        component.source = 'profile';
        component.username = 'testUser';
        component.viewBlog('1');
        expect(router.navigate).toHaveBeenCalledWith(['/blog', '1'], { queryParams: { source: 'profile', username: 'testUser' } });
    });

    it('should set default source to "blog"', () => {
        expect(component.source).toBe('blog');
    });

    it('should not fetch blog author if user_id is not provided', () => {
        component.blog = {
            ...component.blog,
            user_id: '',
        };
        component.ngOnInit();
        expect(userServiceSpy.getUserById).not.toHaveBeenCalled();
    });
});