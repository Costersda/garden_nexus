import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ForumPreviewComponent } from './forum-preview.component';
import { UserService } from '../../../shared/services/user.service';
import { CommentService } from '../../../shared/services/comment.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Forum } from '../../types/forum.interface';

describe('ForumPreviewComponent', () => {
    let component: ForumPreviewComponent;
    let fixture: ComponentFixture<ForumPreviewComponent>;
    let userServiceSpy: jasmine.SpyObj<UserService>;
    let commentServiceSpy: jasmine.SpyObj<CommentService>;
    let router: Router;

    beforeEach(async () => {
        userServiceSpy = jasmine.createSpyObj('UserService', ['getUserById']);
        commentServiceSpy = jasmine.createSpyObj('CommentService', ['getCommentsByForumId']);

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule, ForumPreviewComponent],
            providers: [
                { provide: UserService, useValue: userServiceSpy },
                { provide: CommentService, useValue: commentServiceSpy }
            ]
        }).compileComponents();

        router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        fixture = TestBed.createComponent(ForumPreviewComponent);
        component = fixture.componentInstance;

        // Set up default forum object
        component.forum = {
            _id: '1',
            title: 'Test Forum',
            user_id: '123',
            content: 'This is a test forum post with more than thirty words to ensure the preview works correctly.',
            categories: ['category1'],
            comments: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch forum author username on init', () => {
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

        commentServiceSpy.getCommentsByForumId.and.returnValue(of([]));

        component.ngOnInit();
        expect(userServiceSpy.getUserById).toHaveBeenCalledWith('123');
        expect(component.forumAuthor).toBe('testuser');
    });

    it('should navigate to forum with "forum" source', () => {
        component.source = 'forum';
        component.viewForum('1');
        expect(router.navigate).toHaveBeenCalledWith(['/forum', '1'], { queryParams: { source: 'forum' } });
    });

    it('should navigate to forum with "profile" source and username', () => {
        component.source = 'profile';
        component.username = 'testUser';
        component.viewForum('1');
        expect(router.navigate).toHaveBeenCalledWith(['/forum', '1'], { queryParams: { source: 'profile', username: 'testUser' } });
    });

    it('should set default source to "forum"', () => {
        expect(component.source).toBe('forum');
    });

    it('should not fetch forum author if user_id is not provided', () => {
        component.forum = { user_id: '' } as Forum;
    
        // Spy on ngOnInit to see what's happening
        spyOn(component, 'ngOnInit').and.callThrough();
    
        component.ngOnInit();
    
        expect(component.ngOnInit).toHaveBeenCalled();
        expect(userServiceSpy.getUserById).not.toHaveBeenCalled();
        expect(component.forumAuthor).toBe('');
      });
});