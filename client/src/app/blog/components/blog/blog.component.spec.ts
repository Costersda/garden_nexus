import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BlogComponent } from './blog.component';
import { BlogService } from '../../../shared/services/blog.service';
import { of, throwError } from 'rxjs';
import { Blog } from '../../../shared/types/blog.interface';
import { CATEGORIES } from '../../../shared/types/category.interface';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

@Component({
    selector: 'app-blog-preview', template: '',
    standalone: false
})
class MockBlogPreviewComponent {
  @Input() blog!: Blog;
}

describe('BlogComponent', () => {
    let component: BlogComponent;
    let fixture: ComponentFixture<BlogComponent>;
    let blogServiceSpy: jasmine.SpyObj<BlogService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('BlogService', ['getAllBlogs', 'getBlogsBySearch']);

        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                FormsModule
            ],
            declarations: [
                BlogComponent,
                MockToolbarComponent,
                MockNavbarComponent,
                MockFooterComponent,
                MockBlogPreviewComponent 
            ],
            providers: [
                { provide: BlogService, useValue: spy }
            ]
        }).compileComponents();

        blogServiceSpy = TestBed.inject(BlogService) as jasmine.SpyObj<BlogService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BlogComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch blogs on init', () => {
        const mockBlogs: Blog[] = [
            {
                _id: '1',
                user_id: 'user1',
                title: 'Blog 1',
                content_section_1: 'Content 1',
                image_1: 'image1.jpg',
                categories: ['Category1'],
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: '2',
                user_id: 'user2',
                title: 'Blog 2',
                content_section_1: 'Content 2',
                image_1: 'image2.jpg',
                categories: ['Category2'],
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        blogServiceSpy.getAllBlogs.and.returnValue(of(mockBlogs));

        fixture.detectChanges();

        expect(blogServiceSpy.getAllBlogs).toHaveBeenCalled();
        expect(component.blogs.length).toBe(2);
        expect(component.displayedBlogs.length).toBe(2);
    });

    it('should handle error when fetching blogs', () => {
        blogServiceSpy.getAllBlogs.and.returnValue(throwError('Error'));
        spyOn(console, 'error');

        fixture.detectChanges();

        expect(console.error).toHaveBeenCalledWith('Error fetching blogs', 'Error');
    });

    it('should search blogs', () => {
        const mockSearchResults: Blog[] = [
            {
                _id: '1',
                user_id: 'user1',
                title: 'Search Result',
                content_section_1: 'Content',
                image_1: 'image.jpg',
                categories: ['Category1'],
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        blogServiceSpy.getBlogsBySearch.and.returnValue(of(mockSearchResults));

        component.searchQuery = 'test';
        component.categories[0].selected = true;
        component.searchBlogs();

        expect(blogServiceSpy.getBlogsBySearch).toHaveBeenCalledWith('test', [CATEGORIES[0].name]);
        expect(component.blogs.length).toBe(1);
        expect(component.displayedBlogs.length).toBe(1);
        expect(component.blogHeader).toBe('Search Results');
        expect(component.isSearchActive).toBeTrue();
    });

    it('should handle no search results', () => {
        blogServiceSpy.getBlogsBySearch.and.returnValue(of([]));

        component.searchBlogs();

        expect(component.noResults).toBeTrue();
    });

    it('should sort blogs by newest', () => {
        const oldDate = new Date(2022, 0, 1);
        const newDate = new Date(2023, 0, 1);
        component.blogs = [
            {
                _id: '1',
                user_id: 'user1',
                title: 'Old Blog',
                content_section_1: 'Content',
                image_1: 'image1.jpg',
                categories: ['Category1'],
                comments: [],
                createdAt: oldDate,
                updatedAt: oldDate
            },
            {
                _id: '2',
                user_id: 'user2',
                title: 'New Blog',
                content_section_1: 'Content',
                image_1: 'image2.jpg',
                categories: ['Category2'],
                comments: [],
                createdAt: newDate,
                updatedAt: newDate
            }
        ];

        component.sortBlogs('newest');

        expect(component.blogs[0].title).toBe('New Blog');
        expect(component.blogHeader).toBe('Newest Blog Posts');
    });

    it('should sort blogs by oldest', () => {
        const oldDate = new Date(2022, 0, 1);
        const newDate = new Date(2023, 0, 1);
        component.blogs = [
            {
                _id: '1',
                user_id: 'user1',
                title: 'Old Blog',
                content_section_1: 'Content',
                image_1: 'image1.jpg',
                categories: ['Category1'],
                comments: [],
                createdAt: oldDate,
                updatedAt: oldDate
            },
            {
                _id: '2',
                user_id: 'user2',
                title: 'New Blog',
                content_section_1: 'Content',
                image_1: 'image2.jpg',
                categories: ['Category2'],
                comments: [],
                createdAt: newDate,
                updatedAt: newDate
            }
        ];

        component.sortBlogs('oldest');

        expect(component.blogs[0].title).toBe('Old Blog');
        expect(component.blogHeader).toBe('Oldest Blog Posts');
    });

    it('should load more blogs', () => {
        component.blogs = Array(10).fill({}).map((_, i) => ({
            _id: i.toString(),
            user_id: `user${i}`,
            title: `Blog ${i}`,
            content_section_1: 'Content',
            image_1: `image${i}.jpg`,
            categories: ['Category1'],
            comments: [],
            createdAt: new Date(),
            updatedAt: new Date()
        }));
        component.displayedBlogs = component.blogs.slice(0, 6);

        component.loadMoreBlogs();

        expect(component.displayedBlogs.length).toBe(10);
    });

    it('should disable search button when no query and no categories selected', () => {
        component.searchQuery = '';
        component.categories.forEach(cat => cat.selected = false);

        expect(component.isSearchButtonDisabled).toBeTrue();
    });

    it('should enable search button when query is present', () => {
        component.searchQuery = 'test';
        component.categories.forEach(cat => cat.selected = false);

        expect(component.isSearchButtonDisabled).toBeFalse();
    });

    it('should enable search button when a category is selected', () => {
        component.searchQuery = '';
        component.categories[0].selected = true;

        expect(component.isSearchButtonDisabled).toBeFalse();
    });
});