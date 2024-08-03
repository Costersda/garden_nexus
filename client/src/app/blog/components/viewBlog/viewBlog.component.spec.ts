import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EMPTY, of, throwError } from 'rxjs';
import { ViewBlogComponent } from './viewBlog.component';
import { BlogService } from '../../../shared/services/blog.service';
import { UserService } from '../../../shared/services/user.service';
import { CommentService } from '../../../shared/services/comment.service';
import { ConfirmationDialogService } from '../../../shared/modules/confirmation-dialog/confirmation-dialog.service';
import { Blog } from '../../../shared/types/blog.interface';
import { User } from '../../../shared/types/user.interface';
import { Comment } from '../../../shared/types/comment.interface';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';

// Mock components
@Component({ selector: 'app-toolbar', template: '' })
class MockToolbarComponent { }

@Component({ selector: 'app-navbar', template: '' })
class MockNavbarComponent { }

@Component({ selector: 'app-footer', template: '' })
class MockFooterComponent { }

describe('ViewBlogComponent', () => {
    let component: ViewBlogComponent;
    let fixture: ComponentFixture<ViewBlogComponent>;
    let mockActivatedRoute: any;
    let mockBlogService: jasmine.SpyObj<BlogService>;
    let mockUserService: jasmine.SpyObj<UserService>;
    let mockCommentService: jasmine.SpyObj<CommentService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockConfirmationDialogService: jasmine.SpyObj<ConfirmationDialogService>;
    let mockLocation: jasmine.SpyObj<Location>;

    beforeEach(async () => {
        mockActivatedRoute = {
            paramMap: of(convertToParamMap({ id: '1' })),
            queryParams: of({ source: 'test', username: 'testuser' }),
            snapshot: {
                paramMap: convertToParamMap({ id: '1' }),
                queryParams: { source: 'test', username: 'testuser' }
            }
        };

        mockBlogService = jasmine.createSpyObj('BlogService', ['getBlogById', 'deleteBlog', 'updateBlog']);
        mockUserService = jasmine.createSpyObj('UserService', ['getUser', 'getUserById']);
        mockCommentService = jasmine.createSpyObj('CommentService', ['getComments', 'getCommentsByBlogId', 'createComment', 'updateCommentById', 'deleteCommentById']);
        mockConfirmationDialogService = jasmine.createSpyObj('ConfirmationDialogService', ['confirm']);
        mockLocation = jasmine.createSpyObj('Location', ['path']);

        mockRouter = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl', 'createUrlTree', 'serializeUrl'], {
            events: of(null),
            url: '/test',
            routeReuseStrategy: { shouldReuseRoute: () => false },
            onSameUrlNavigation: 'reload'
        });
        mockRouter.createUrlTree.and.returnValue({} as UrlTree);
        mockRouter.serializeUrl.and.returnValue('');

        await TestBed.configureTestingModule({
            declarations: [
                ViewBlogComponent,
                MockToolbarComponent,
                MockNavbarComponent,
                MockFooterComponent,
            ],
            imports: [RouterTestingModule],
            providers: [
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: Router, useValue: mockRouter },
                { provide: Location, useValue: mockLocation },
                { provide: BlogService, useValue: mockBlogService },
                { provide: UserService, useValue: mockUserService },
                { provide: CommentService, useValue: mockCommentService },
                { provide: ConfirmationDialogService, useValue: mockConfirmationDialogService }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(ViewBlogComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        jasmine.clock().uninstall(); // Uninstall fakeAsync clock if used
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch blog on init', () => {
        const mockBlog: Blog = {
            _id: '1',
            user_id: 'user1',
            title: 'Test Blog',
            content_section_1: 'Test content',
            image_1: '',
            categories: [],
            comments: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        mockBlogService.getBlogById.and.returnValue(of(mockBlog));

        fixture.detectChanges();

        expect(mockBlogService.getBlogById).toHaveBeenCalledWith('1');
        expect(component.blog).toEqual(mockBlog);
    });

    it('should set source and username from query params', () => {
        fixture.detectChanges();

        expect(component.source).toBe('test');
        expect(component.username).toBe('testuser');
    });

    it('should fetch current user from localStorage', () => {
        const mockUser: User = {
            _id: 'user1',
            id: 'user1',
            username: 'testuser',
            email: 'test@example.com',
            isVerified: true,
            following: [],
            followers: []
        };
        spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUser));

        component.fetchCurrentUser();

        expect(component.currentUser).toEqual(mockUser);
    });

    it('should toggle comment dropdown', () => {
        const mockComment: Comment = {
            _id: 'comment1',
            user: {
                _id: 'user1',
                username: 'testuser'
            },
            comment: 'Test comment',
            createdAt: new Date(),
            replyText: ''
        };
        component.comments = [mockComment];

        component.toggleDropdown(mockComment, new MouseEvent('click'));

        expect(component.comments[0].showDropdown).toBe(true);
    });

    it('should toggle blog dropdown', () => {
        component.toggleBlogDropdown(new MouseEvent('click'));

        expect(component.showBlogDropdown).toBe(true);
    });

    it('should close dropdowns on outside click', () => {
        component.comments = [{
            _id: 'comment1',
            user: {
                _id: 'user1',
                username: 'testuser'
            },
            comment: 'Test comment',
            createdAt: new Date(),
            showDropdown: true,
            replyText: ''
        }];
        component.showBlogDropdown = true;

        component.onClickOutside(new MouseEvent('click'));

        expect(component.comments[0].showDropdown).toBe(false);
        expect(component.showBlogDropdown).toBe(false);
    });

    describe('fetchBlog', () => {
        it('should fetch blog and related data when blog exists', () => {
            const mockBlog: Blog = {
                _id: '1',
                user_id: 'user1',
                title: 'Test Blog',
                content_section_1: 'Test content',
                image_1: 'test.jpg',
                categories: [],
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockBlogService.getBlogById.and.returnValue(of(mockBlog));
            spyOn(component, 'fetchUser');
            spyOn(component, 'fetchComments');

            component.fetchBlog('1');

            expect(mockBlogService.getBlogById).toHaveBeenCalledWith('1');
            expect(component.blog).toEqual(mockBlog);
            expect(component.fetchUser).toHaveBeenCalledWith('user1');
            expect(component.fetchComments).toHaveBeenCalledWith('1');
        });

        it('should redirect to blogs list when blog is not found', fakeAsync(() => {
            mockBlogService.getBlogById.and.returnValue(of(null as unknown as Blog));

            component.fetchBlog('1');
            tick();

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/blogs']);
        }));

        it('should navigate to blogs list on error', () => {
            mockBlogService.getBlogById.and.returnValue(throwError(() => new Error('error')));

            component.fetchBlog('1');

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/blogs']);
        });
    });

    describe('deleteBlog', () => {

        it('should delete blog when confirmed', async () => {
            const blogId = '1';
            mockConfirmationDialogService.confirm.and.returnValue(Promise.resolve(true));
            mockBlogService.deleteBlog.and.returnValue(of(undefined));
            spyOn(history, 'replaceState');

            await component.deleteBlog(blogId);

            expect(mockConfirmationDialogService.confirm).toHaveBeenCalledWith(
                'Confirm Deletion',
                'Are you sure you want to delete this blog?'
            );
            expect(mockBlogService.deleteBlog).toHaveBeenCalledWith(blogId);
            expect(history.replaceState).toHaveBeenCalledWith(null, '', '/blogs');
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/blogs']);
        });

        it('should not delete blog when not confirmed', async () => {
            mockConfirmationDialogService.confirm.and.returnValue(Promise.resolve(false));

            await component.deleteBlog('1');

            expect(mockBlogService.deleteBlog).not.toHaveBeenCalled();
            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });

        it('should handle error when deleting blog', async () => {
            const blogId = '1';
            const error = new Error('Delete failed');
            mockConfirmationDialogService.confirm.and.returnValue(Promise.resolve(true));
            mockBlogService.deleteBlog.and.returnValue(throwError(error));
            spyOn(console, 'error');

            await component.deleteBlog(blogId);

            expect(mockBlogService.deleteBlog).toHaveBeenCalledWith(blogId);
            expect(console.error).toHaveBeenCalledWith('Error deleting blog:', error);
            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });
    });

    describe('toggleEditMode', () => {
        it('should toggle edit mode and save changes when exiting edit mode', () => {
            spyOn(component, 'saveBlogChanges');
            component.isEditMode = false;

            component.toggleEditMode();

            expect(component.isEditMode).toBe(true);
            expect(component.saveBlogChanges).not.toHaveBeenCalled();

            component.toggleEditMode();

            expect(component.isEditMode).toBe(false);
            expect(component.saveBlogChanges).toHaveBeenCalled();
        });
    });

    describe('saveBlogChanges', () => {
        beforeEach(() => {
            component.blog = {
                user_id: '1',
                _id: '1',
                title: 'Test Blog',
                image_1: 'test.jpg',
                content_section_1: 'Test content',
                categories: [],
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
        });

        it('should update blog when all validations pass', fakeAsync(() => {
            // Setup
            component.blog = {
                _id: '1',
                user_id: '1',
                title: 'Test Blog',
                image_1: 'test.jpg',
                content_section_1: 'Test content',
                categories: [],
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isEdited: false
            };
            component.isEditMode = true;
            component.maxTitleLength = 100;
            component.fileSizeError = {};

            // Use type assertion here
            spyOn<any>(component, 'hasFormErrors').and.returnValue(false);

            mockBlogService.updateBlog.and.returnValue(of(component.blog));

            // Action
            component.saveBlogChanges();
            tick();

            // Assertions
            expect(mockBlogService.updateBlog).toHaveBeenCalledWith('1', jasmine.objectContaining({
                _id: '1',
                title: 'Test Blog',
                image_1: 'test.jpg',
                isEdited: true
            }));
            expect(component.isEditMode).toBe(false);
            expect(component.formSubmitted).toBe(false);
            expect(component.titleError).toBeNull();
        }));

        it('should not update blog when title is empty', () => {
            if (component.blog) {
                component.blog.title = '';

                component.saveBlogChanges();
            }

            expect(component.titleError).toBe('Title is required');
            expect(mockBlogService.updateBlog).not.toHaveBeenCalled();
        });

        it('should not update blog when title exceeds maximum length', () => {
            if (component.blog) {
                component.blog.title = 'A'.repeat(component.maxTitleLength + 1);

                component.saveBlogChanges();
            }
            expect(component.titleError).toBe('Title exceeds maximum length');
            expect(mockBlogService.updateBlog).not.toHaveBeenCalled();
        });

        it('should not update blog when image is missing', () => {
            if (component.blog) {
                component.blog.image_1 = '';

                component.saveBlogChanges();
            }
            expect(component.fileSizeError['image_1']).toBe('Image 1 is required');
            expect(mockBlogService.updateBlog).not.toHaveBeenCalled();
        });
    });

    describe('checkTitleValidity', () => {
        it('should set titleError when title is empty', () => {
            component.blog = { title: '' } as Blog;

            component.checkTitleValidity();

            expect(component.titleError).toBe('Title is required');
        });

        it('should set titleError when title exceeds maximum length', () => {
            component.blog = { title: 'A'.repeat(component.maxTitleLength + 1) } as Blog;

            component.checkTitleValidity();

            expect(component.titleError).toBe('Title exceeds maximum length');
        });

        it('should clear titleError when title is valid', () => {
            component.blog = { title: 'Valid Title' } as Blog;

            component.checkTitleValidity();

            expect(component.titleError).toBeNull();
        });
    });

    describe('cancelEdit', () => {
        it('should revert changes and exit edit mode', () => {
            component.blog = { title: 'Changed Title' } as Blog;
            component.originalBlog = { title: 'Original Title' } as Blog;
            component.isEditMode = true;
            component.titleError = 'Some error';

            component.cancelEdit();

            expect(component.blog).toEqual(component.originalBlog);
            expect(component.isEditMode).toBe(false);
            expect(component.titleError).toBeNull();
        });
    });

    describe('deleteImage', () => {
        it('should delete image for the specified section', () => {
            component.blog = { image_1: 'image1.jpg' } as Blog;

            component.deleteImage(1);

            expect(component.blog.image_1).toBe('');
        });
    });

    describe('onFileChange', () => {
        it('should set file size error if file is too large', () => {
            const event = {
                target: {
                    files: [new File([''], 'large.jpg', { type: 'image/jpeg' })]
                }
            };
            Object.defineProperty(event.target.files[0], 'size', { value: 3 * 1024 * 1024 });
            component.onFileChange(event, 'image_1');
            expect(component.fileSizeError['image_1']).toBe('File size exceeds 2 MB');
        });

        it('should set file type error if file is not an image', () => {
            const event = {
                target: {
                    files: [new File([''], 'doc.pdf', { type: 'application/pdf' })]
                }
            };
            component.onFileChange(event, 'image_1');
            expect(component.fileTypeError['image_1']).toBe('Invalid file type');
        });

        it('should clear errors and read file if valid', () => {
            const event = {
                target: {
                    files: [new File([''], 'test.jpg', { type: 'image/jpeg' })]
                }
            };
            spyOn(FileReader.prototype, 'readAsDataURL');
            component.onFileChange(event, 'image_1');
            expect(component.fileSizeError['image_1']).toBe('');
            expect(component.fileTypeError['image_1']).toBe('');
            expect(FileReader.prototype.readAsDataURL).toHaveBeenCalled();
        });
    });

    describe('fetchUser', () => {
        it('should fetch user and set user property', () => {
            const mockUser: User = {
                _id: '1',
                id: '1',
                username: 'testUser',
                email: 'testUser@example.com',
                isVerified: true,
                following: [],
                followers: []
            };
            mockUserService.getUserById.and.returnValue(of(mockUser));

            component.fetchUser('1');

            expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
            expect(component.user).toEqual(mockUser);
        });

        it('should handle error when fetching user', () => {
            const error = new Error('User not found');
            mockUserService.getUserById.and.returnValue(throwError(() => error));
            spyOn(console, 'error');

            component.fetchUser('1');

            expect(console.error).toHaveBeenCalledWith('Error fetching user:', error);
        });
    });

    describe('fetchComments', () => {
        it('should fetch comments and normalize IDs', () => {
            const mockComments: Comment[] = [
                {
                    _id: '1',
                    user: { _id: '1', username: 'user1' },
                    comment: 'Test comment',
                    createdAt: new Date(),
                    replyText: '',
                    showDropdown: false
                },
                {
                    id: '2',
                    user: { _id: '2', username: 'user2' },
                    comment: 'Another comment',
                    createdAt: new Date(),
                    replyText: '',
                    showDropdown: false
                }
            ];
            mockCommentService.getCommentsByBlogId.and.returnValue(of(mockComments));

            component.fetchComments('blogId');

            expect(mockCommentService.getCommentsByBlogId).toHaveBeenCalledWith('blogId');
            expect(component.comments.length).toBe(2);
            expect(component.comments[0]._id).toBe('1');
            expect(component.comments[1]._id).toBe('2');
            expect(component.comments[0].user._id).toBe('1');
            expect(component.comments[1].user._id).toBe('2');
        });

        it('should handle error when fetching comments', () => {
            const error = new Error('Failed to fetch comments');
            mockCommentService.getCommentsByBlogId.and.returnValue(throwError(() => error));
            spyOn(console, 'error');

            component.fetchComments('blogId');

            expect(console.error).toHaveBeenCalledWith('Error fetching comments:', error);
        });
    });

    describe('checkCommentLength', () => {
        beforeEach(() => {
            component.maxCommentLength = 100;
        });

        it('should set isNewCommentTooLong to true if new comment exceeds max length', () => {
            component.newComment = 'a'.repeat(101);
            component.checkCommentLength('new');
            expect(component.isNewCommentTooLong).toBeTrue();
        });

        it('should set isNewCommentTooLong to false if new comment is within max length', () => {
            component.newComment = 'a'.repeat(100);
            component.checkCommentLength('new');
            expect(component.isNewCommentTooLong).toBeFalse();
        });

        it('should set isEditCommentTooLong to true if edit comment exceeds max length', () => {
            component.editCommentText = 'a'.repeat(101);
            component.checkCommentLength('edit');
            expect(component.isEditCommentTooLong).toBeTrue();
        });

        it('should set isEditCommentTooLong to false if edit comment is within max length', () => {
            component.editCommentText = 'a'.repeat(100);
            component.checkCommentLength('edit');
            expect(component.isEditCommentTooLong).toBeFalse();
        });
    });

    describe('addComment', () => {
        beforeEach(() => {
            component.currentUser = {
                _id: '1',
                id: '1',
                email: 'test@email.com',
                username: 'test',
                country: 'new zealand',
                bio: 'test',
                imageFile: '1',
                isVerified: true,
                following: [],
                followers: []
            };
            component.blog = {
                _id: 'blog1',
                user_id: '1',
                title: 'testTitle',
                content_section_1: 'string',
                content_section_2: 'string',
                content_section_3: 'string',
                image_1: '1',
                image_2: '1',
                image_3: "1",
                categories: ['trees'],
                comments: [],
                isEdited: false,
                createdAt: new Date('2023-01-01T00:00:00Z'),
                updatedAt: new Date('2023-01-01T00:00:00Z')
            };
        });

        it('should not add comment if newComment is empty', () => {
            component.newComment = '';
            component.addComment();
            expect(mockCommentService.createComment).not.toHaveBeenCalled();
        });

        it('should not add comment if newComment is too long', () => {
            component.newComment = 'a'.repeat(101);
            component.isNewCommentTooLong = true;
            component.addComment();
            expect(mockCommentService.createComment).not.toHaveBeenCalled();
        });

        it('should add comment successfully', () => {
            const newComment = {
                _id: 'comment1',
                user: { _id: 'user1', username: 'testUser', imageFile: 'test.jpg' },
                blogId: 'blog1',
                replyText: "",
                comment: 'Test comment',
                createdAt: new Date(),
                replyingTo: undefined
            };
            mockCommentService.createComment.and.returnValue(of(newComment));

            component.newComment = 'Test comment';
            component.addComment();

            expect(mockCommentService.createComment).toHaveBeenCalled();
            expect(component.comments.length).toBe(1);
            expect(component.comments[0]).toEqual(newComment);
            expect(component.newComment).toBe('');
            expect(component.isNewCommentTooLong).toBeFalse();
        });

        it('should handle error when adding comment', () => {
            const error = new Error('Failed to add comment');
            mockCommentService.createComment.and.returnValue(throwError(() => error));
            spyOn(console, 'error');

            component.newComment = 'Test comment';
            component.addComment();

            expect(console.error).toHaveBeenCalledWith('Error adding comment:', error);
        });
    });

    describe('deleteComment', () => {
        it('should not attempt to delete when commentId is undefined', async () => {
            spyOn(console, 'error');
            await component.deleteComment(undefined);
            expect(console.error).toHaveBeenCalledWith('Comment ID is undefined');
            expect(mockCommentService.deleteCommentById).not.toHaveBeenCalled();
        });

        it('should delete comment when confirmed', async () => {
            const commentId = '1';
            mockConfirmationDialogService.confirm.and.returnValue(Promise.resolve(true));
            mockCommentService.deleteCommentById.and.returnValue(of(void 0));

            component.comments = [
                {
                    _id: '1',
                    comment: 'Test',
                    user: {
                        _id: 'user1',
                        username: 'testuser'
                    },
                    createdAt: new Date(),
                    replyText: ''
                },
                {
                    _id: '2',
                    comment: 'Test 2',
                    user: {
                        _id: 'user2',
                        username: 'testuser2'
                    },
                    createdAt: new Date(),
                    replyText: ''
                }
            ];

            await component.deleteComment(commentId);

            expect(mockCommentService.deleteCommentById).toHaveBeenCalledWith(commentId);
            expect(component.comments.length).toBe(1);
            expect(component.comments[0]._id).toBe('2');
        });

        it('should not delete comment when not confirmed', async () => {
            const commentId = '1';
            mockConfirmationDialogService.confirm.and.returnValue(Promise.resolve(false));

            await component.deleteComment(commentId);

            expect(mockCommentService.deleteCommentById).not.toHaveBeenCalled();
        });

        it('should handle error when deleting comment', async () => {
            const commentId = '1';
            const error = new Error('Delete failed');
            mockConfirmationDialogService.confirm.and.returnValue(Promise.resolve(true));
            mockCommentService.deleteCommentById.and.returnValue(throwError(() => error));
            spyOn(console, 'error');

            await component.deleteComment(commentId);

            expect(console.error).toHaveBeenCalledWith('Error deleting comment:', error);
        });
    });

    describe('editComment', () => {
        it('should set up comment for editing', () => {
            const comment: Comment = {
                _id: '1',
                comment: 'Test comment',
                user: {
                    _id: 'user1',
                    username: 'testuser'
                },
                createdAt: new Date(),
                replyText: ''
            };

            component.editComment(comment);

            expect(component.commentBeingEdited).toEqual(comment);
            expect(component.editCommentText).toBe('Test comment');
            expect(component.isEditCommentTooLong).toBeFalse();
        });

        it('should focus on textarea after editing', fakeAsync(() => {
            const comment: Comment = {
                _id: '1',
                comment: 'Test comment',
                user: {
                    _id: 'user1',
                    username: 'testuser'
                },
                createdAt: new Date(),
                replyText: ''
            };

            const mockTextarea = { focus: jasmine.createSpy('focus') };
            spyOn(document, 'querySelector').and.returnValue(mockTextarea as any);

            component.editComment(comment);
            tick();

            expect(document.querySelector).toHaveBeenCalledWith('.edit-comment-textarea');
            expect(mockTextarea.focus).toHaveBeenCalled();
        }));
    });

    describe('cancelEditComment', () => {
        it('should reset edit state', () => {
            component.commentBeingEdited = {
                _id: '1',
                comment: 'Test comment',
                user: {
                    _id: 'user1',
                    username: 'testuser'
                },
                createdAt: new Date(),
                replyText: ''
            };
            component.editCommentText = 'Edited test';
            component.isEditCommentTooLong = true;

            component.cancelEditComment();

            expect(component.commentBeingEdited).toBeNull();
            expect(component.editCommentText).toBe('');
            expect(component.isEditCommentTooLong).toBeFalse();
        });
    });

    describe('saveEditedComment', () => {
        it('should not save when editCommentText is empty', () => {
            component.editCommentText = '';
            component.saveEditedComment();
            expect(mockCommentService.updateCommentById).not.toHaveBeenCalled();
        });

        it('should not save when commentBeingEdited is null', () => {
            component.editCommentText = 'Test';
            component.commentBeingEdited = null;
            component.saveEditedComment();
            expect(mockCommentService.updateCommentById).not.toHaveBeenCalled();
        });

        it('should not save when isEditCommentTooLong is true', () => {
            component.editCommentText = 'Test';
            component.commentBeingEdited = {
                _id: '1',
                comment: 'Test comment',
                user: {
                    _id: 'user1',
                    username: 'testuser'
                },
                createdAt: new Date(),
                replyText: ''
            };
            component.isEditCommentTooLong = true;
            component.saveEditedComment();
            expect(mockCommentService.updateCommentById).not.toHaveBeenCalled();
        });

        it('should update comment locally and on server', () => {
            component.editCommentText = 'Edited comment';
            component.commentBeingEdited = {
                _id: '1',
                comment: 'Test comment',
                user: {
                    _id: 'user1',
                    username: 'testuser'
                },
                createdAt: new Date(),
                replyText: ''
            };
            component.comments = [{
                _id: '1',
                comment: 'Test comment',
                user: {
                    _id: 'user1',
                    username: 'testuser'
                },
                createdAt: new Date(),
                replyText: ''
            }];
            mockCommentService.updateCommentById.and.returnValue(of({
                _id: '1', comment: 'Edited comment',
                user: {
                    _id: 'user1',
                    username: 'testuser'
                },
                createdAt: new Date(),
                replyText: ''
            }));

            component.saveEditedComment();

            expect(component.comments[0].comment).toBe('Edited comment ');
            expect(mockCommentService.updateCommentById).toHaveBeenCalledWith('1', jasmine.objectContaining({
                _id: '1',
                comment: 'Edited comment',
                isEdited: true
            }));
            expect(component.commentBeingEdited).toBeNull();
            expect(component.editCommentText).toBe('');
        });

        it('should handle error when updating comment', (done) => {
            component.editCommentText = 'Edited comment';
            component.commentBeingEdited = {
                _id: '1', comment: 'Original comment',
                user: {
                    _id: 'user1',
                    username: 'testuser'
                },
                createdAt: new Date(),
                replyText: ''
            };
            component.comments = [{
                _id: '1', comment: 'Original comment',
                user: {
                    _id: 'user1',
                    username: 'testuser'
                },
                createdAt: new Date(),
                replyText: ''
            }];
            component.blog = {
                _id: 'blogId',
                user_id: '1',
                title: 'testTitle',
                content_section_1: 'string',
                content_section_2: 'string',
                content_section_3: 'string',
                image_1: '1',
                image_2: '1',
                image_3: "1",
                categories: ['trees'],
                comments: [],
                isEdited: false,
                createdAt: new Date('2023-01-01T00:00:00Z'),
                updatedAt: new Date('2023-01-01T00:00:00Z')
            };
            const error = new Error('Update failed');
            mockCommentService.updateCommentById.and.returnValue(throwError(() => error));
            mockCommentService.getCommentsByBlogId.and.returnValue(of([]));
            spyOn(console, 'error');
            spyOn(component, 'fetchComments').and.callThrough();

            component.saveEditedComment();

            setTimeout(() => {
                expect(console.error).toHaveBeenCalledWith('Error editing comment:', error);
                expect(component.fetchComments).toHaveBeenCalledWith('blogId');
                expect(mockCommentService.getCommentsByBlogId).toHaveBeenCalledWith('blogId');
                done();
            }, 0);
        });

    });

    describe('goBack', () => {
        it('should navigate to profile when source is profile', () => {
            component.source = 'profile';
            component.username = 'testuser';
            component.goBack();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile', 'testuser']);
        });

        it('should navigate to blogs when source is not profile', () => {
            component.source = 'other';
            component.goBack();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/blogs']);
        });
    });

    describe('getImageUrl', () => {
        it('should return default image when imageFile is null', () => {
            expect(component.getImageUrl(null)).toBe('assets/garden-nexus-logo.webp');
        });

        it('should cache URL for Buffer type imageFile', () => {
            const imageFile = { type: 'Buffer', data: [1, 2, 3] };
            const url = component.getImageUrl(imageFile);

            expect(url).toContain('blob:');
            expect(component.imageUrls).toContain(url);
            expect(component.isUrlCached(imageFile)).toBeTrue();
        });

        it('should return cached URL if available', () => {
            const imageFile = { type: 'Buffer', data: [1, 2, 3] };
            const firstUrl = component.getImageUrl(imageFile);
            const secondUrl = component.getImageUrl(imageFile);

            expect(firstUrl).toBe(secondUrl);
        });

        it('should return imageFile if it\'s a string', () => {
            const imageUrl = 'http://example.com/image.jpg';
            expect(component.getImageUrl(imageUrl)).toBe(imageUrl);
        });

        it('should return default image for unsupported imageFile type', () => {
            const unsupportedImageFile = { type: 'unsupported' };
            expect(component.getImageUrl(unsupportedImageFile)).toBe('assets/garden-nexus-logo.webp');
        });
    });

    describe('Form Validation', () => {
        it('should indicate form is invalid when blog is null', () => {
            component.blog = null;
            expect(component.isFormValid).toBeFalse();
        });

        it('should indicate form is invalid when title is too long', () => {
            component.blog = {
                title: 'a'.repeat(component.maxTitleLength + 1),
                content_section_1: 'Valid content',
                image_1: 'valid-image.jpg',
                categories: ['valid-category']
            } as any;
            expect(component.isFormValid).toBeFalse();
        });

        it('should indicate form is invalid when content_section_1 is invalid', () => {
            component.blog = {
                title: 'Valid Title',
                content_section_1: 'a'.repeat(component.maxContentWords + 1),
                image_1: 'valid-image.jpg',
                categories: ['valid-category']
            } as any;
            expect(component.isFormValid).toBeFalse();
        });

        it('should indicate form is invalid when image_1 is missing', () => {
            component.blog = {
                title: 'Valid Title',
                content_section_1: 'Valid content',
                image_1: '',
                categories: ['valid-category']
            } as any;
            expect(component.isFormValid).toBeFalse();
        });

        it('should indicate form is valid when all required fields are valid', () => {
            component.blog = {
              title: 'Valid Title',
              content_section_1: 'Valid content '.repeat(component.minContentWords),
              content_section_2: '',
              content_section_3: '',
              image_1: 'valid-image.jpg',
              categories: ['valid-category']
            } as any;
            component.fileSizeError = {};
            component.fileTypeError = {};
            
            const result = component.isFormValid;
            console.log('Is form valid:', result);
            
            expect(result).toBeTrue();
          });
    });

    describe('isContentValid', () => {
        it('should return true for empty optional sections', () => {
            component.blog = { content_section_2: '' } as any;
            expect(component.isContentValid('content_section_2')).toBeTrue();
        });

        it('should return false if word count is below minimum', () => {
            component.blog = { content_section_1: 'short content' } as any;
            component.minContentWords = 10;
            expect(component.isContentValid('content_section_1')).toBeFalse();
        });

        // Add more tests for other conditions
    });

    describe('getContentWordCount', () => {
        it('should correctly count words', () => {
            expect(component.getContentWordCount('This is a test')).toBe(4);
            expect(component.getContentWordCount('  Multiple   spaces   ')).toBe(2);
            expect(component.getContentWordCount('')).toBe(0);
        });
    });

    describe('areAllWordsValid', () => {
        it('should return true if all words are within max length', () => {
            component.maxWordLength = 5;
            expect(component.areAllWordsValid('Short words only')).toBeTrue();
        });

        it('should return false if any word exceeds max length', () => {
            component.maxWordLength = 5;
            expect(component.areAllWordsValid('This has a longerword')).toBeFalse();
        });
    });

    describe('isContentTooShort', () => {
        it('should return false for empty optional sections', () => {
            component.blog = { content_section_2: '' } as any;
            expect(component.isContentTooShort('content_section_2')).toBeFalse();
        });

        it('should return true if content is below minimum word count', () => {
            component.blog = { content_section_1: 'Short content' } as any;
            component.minContentWords = 10;
            expect(component.isContentTooShort('content_section_1')).toBeTrue();
        });
    });

    describe('isContentTooLong', () => {
        it('should return false for empty sections', () => {
            component.blog = { content_section_1: '' } as any;
            expect(component.isContentTooLong('content_section_1')).toBeFalse();
        });

        it('should return true if content exceeds maximum word count', () => {
            component.blog = { content_section_1: 'This is a long content'.repeat(100) } as any;
            component.maxContentWords = 10;
            expect(component.isContentTooLong('content_section_1')).toBeTrue();
        });
    });

    describe('hasImageErrors', () => {
        it('should return true if there are file size errors', () => {
            component.fileSizeError = { image_1: 'File too large' };
            expect(component.hasImageErrors()).toBeTrue();
        });

        it('should return true if there are file type errors', () => {
            component.fileTypeError = { image_2: 'Invalid file type' };
            expect(component.hasImageErrors()).toBeTrue();
        });

        it('should return false if there are no errors', () => {
            component.fileSizeError = {};
            component.fileTypeError = {};
            expect(component.hasImageErrors()).toBeFalse();
        });
    });

    describe('addAutoGrow', () => {
        it('should add event listeners to textareas', () => {
            const textareas = [
                { addEventListener: jasmine.createSpy() },
                { addEventListener: jasmine.createSpy() }
            ];
            spyOn(document, 'querySelectorAll').and.returnValue(textareas as any);
            spyOn(component, 'autoGrow');

            component.addAutoGrow();

            expect(textareas[0].addEventListener).toHaveBeenCalledWith('input', jasmine.any(Function), false);
            expect(textareas[1].addEventListener).toHaveBeenCalledWith('input', jasmine.any(Function), false);
        });
    });

    describe('autoGrow', () => {
        it('should adjust textarea height', () => {
            const textarea = {
                style: { height: '100px' },
                scrollHeight: 150
            };
            component.autoGrow.call(textarea as any);
            expect(textarea.style.height).toBe('150px');
        });
    });

    describe('toggleCategory', () => {
        beforeEach(() => {
            component.blog = {
                categories: ['existing']
            } as any;
        });

        it('should add category if not present', () => {
            component.toggleCategory('new');
            expect(component.blog?.categories).toContain('new');
        });

        it('should remove category if already present', () => {
            component.blog!.categories.push('remove');
            component.toggleCategory('remove');
            expect(component.blog?.categories).not.toContain('remove');
        });

        it('should not throw error if blog is null', () => {
            component.blog = null;
            expect(() => component.toggleCategory('new')).not.toThrow();
        });

        it('should not throw error if blog.categories is undefined', () => {
            component.blog = {} as any;
            expect(() => component.toggleCategory('new')).not.toThrow();
        });
    });

    describe('quoteComment', () => {
        it('should set up reply to comment', () => {
            const comment = { comment: 'Test comment' } as Comment;

            // Create a more complete mock of HTMLTextAreaElement
            const mockTextarea = document.createElement('textarea');
            spyOn(mockTextarea, 'focus');
            spyOn(mockTextarea, 'scrollIntoView');

            // Mock querySelector to return our mockTextarea
            spyOn(document, 'querySelector').and.returnValue(mockTextarea);

            component.quoteComment(comment);

            expect(component.replyingToComment).toBe(comment);
            expect(component.replyText).toBe('"Test comment"');
            expect(mockTextarea.focus).toHaveBeenCalled();
            expect(mockTextarea.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
        });

        it('should handle case when textarea is not found', () => {
            const comment = { comment: 'Test comment' } as Comment;

            // Mock querySelector to return null
            spyOn(document, 'querySelector').and.returnValue(null);

            // This should not throw an error
            expect(() => component.quoteComment(comment)).not.toThrow();

            expect(component.replyingToComment).toBe(comment);
            expect(component.replyText).toBe('"Test comment"');
        });
    });

    describe('cancelReply', () => {
        it('should reset reply state', () => {
            component.replyingToComment = {} as Comment;
            component.replyText = 'Some reply';

            component.cancelReply();

            expect(component.replyingToComment).toBeNull();
            expect(component.replyText).toBe('');
        });

    })
})