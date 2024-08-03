import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router, convertToParamMap, UrlTree } from '@angular/router';
import { Location } from '@angular/common';
import { EMPTY, of, throwError } from 'rxjs';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';

import { ViewForumComponent } from './viewForum.component';
import { ForumService } from '../../../shared/services/forum.service';
import { UserService } from '../../../shared/services/user.service';
import { CommentService } from '../../../shared/services/comment.service';
import { ConfirmationDialogService } from '../../../shared/modules/confirmation-dialog/confirmation-dialog.service';
import { User } from '../../../shared/types/user.interface';
import { Forum } from '../../../shared/types/forum.interface';
import { Comment } from '../../../shared/types/comment.interface';

// Mock components
@Component({ selector: 'app-toolbar', template: '' })
class MockToolbarComponent { }

@Component({ selector: 'app-navbar', template: '' })
class MockNavbarComponent { }

@Component({ selector: 'app-footer', template: '' })
class MockFooterComponent { }

describe('ViewForumComponent', () => {
    let component: ViewForumComponent;
    let fixture: ComponentFixture<ViewForumComponent>;
    let mockActivatedRoute: any;
    let mockForumService: jasmine.SpyObj<ForumService>;
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

        mockForumService = jasmine.createSpyObj('ForumService', ['getForumById', 'deleteForum', 'updateForum']);
        mockUserService = jasmine.createSpyObj('UserService', ['getUser', 'getUserById']);
        mockCommentService = jasmine.createSpyObj('CommentService', ['getComments', 'getCommentsByForumId', 'createComment', 'updateCommentById', 'deleteCommentById']);
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
                ViewForumComponent,
                MockToolbarComponent,
                MockNavbarComponent,
                MockFooterComponent,
            ],
            imports: [RouterTestingModule],
            providers: [
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: Router, useValue: mockRouter },
                { provide: Location, useValue: mockLocation },
                { provide: ForumService, useValue: mockForumService },
                { provide: UserService, useValue: mockUserService },
                { provide: CommentService, useValue: mockCommentService },
                { provide: ConfirmationDialogService, useValue: mockConfirmationDialogService }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(ViewForumComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        jasmine.clock().uninstall(); // Uninstall fakeAsync clock if used
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should fetch forum and current user when forumId is present', () => {
            spyOn(component, 'fetchCurrentUser');
            spyOn(component, 'fetchForum');

            component.ngOnInit();

            expect(component.fetchCurrentUser).toHaveBeenCalled();
            expect(component.fetchForum).toHaveBeenCalledWith('1');
            expect(component.source).toBe('test');
            expect(component.username).toBe('testuser');
        });

        it('should not fetch forum when forumId is null', () => {
            mockActivatedRoute.paramMap = of(convertToParamMap({}));
            spyOn(component, 'fetchCurrentUser');
            spyOn(component, 'fetchForum');

            component.ngOnInit();

            expect(component.fetchCurrentUser).not.toHaveBeenCalled();
            expect(component.fetchForum).not.toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should unsubscribe from all subscriptions', () => {
            const mockUnsubscribe = jasmine.createSpy('unsubscribe');
            component['routeSubscription'] = { unsubscribe: mockUnsubscribe } as any;
            component['forumSubscription'] = { unsubscribe: mockUnsubscribe } as any;
            component['userSubscription'] = { unsubscribe: mockUnsubscribe } as any;
            component['commentSubscription'] = { unsubscribe: mockUnsubscribe } as any;

            component.ngOnDestroy();

            expect(mockUnsubscribe).toHaveBeenCalledTimes(4);
        });
    });

    describe('onClickOutside', () => {
        it('should close all dropdowns', () => {
            component.comments = [
                { _id: '1', showDropdown: true },
                { _id: '2', showDropdown: true }
            ] as any[];
            component.showForumDropdown = true;

            component.onClickOutside(new MouseEvent('click'));

            expect(component.comments.every(c => !c.showDropdown)).toBeTrue();
            expect(component.showForumDropdown).toBeFalse();
        });
    });

    describe('toggleDropdown', () => {
        it('should toggle dropdown for the specific comment', () => {
            const event = new MouseEvent('click');
            spyOn(event, 'stopPropagation');
            component.comments = [
                { _id: '1', showDropdown: false },
                { _id: '2', showDropdown: false }
            ] as any[];

            component.toggleDropdown({ _id: '1' } as any, event);

            expect(event.stopPropagation).toHaveBeenCalled();
            expect(component.comments[0].showDropdown).toBeTrue();
            expect(component.comments[1].showDropdown).toBeFalse();
        });
    });

    describe('toggleForumDropdown', () => {
        it('should toggle forum dropdown', () => {
            const event = new MouseEvent('click');
            spyOn(event, 'stopPropagation');
            component.showForumDropdown = false;

            component.toggleForumDropdown(event);

            expect(event.stopPropagation).toHaveBeenCalled();
            expect(component.showForumDropdown).toBeTrue();
        });
    });

    describe('fetchCurrentUser', () => {
        it('should fetch current user from localStorage', () => {
            const mockUser = {
                _id: '123',
                id: '123',
                email: 'testuser@example.com',
                username: 'testuser',
                isVerified: true,
                following: [],
                followers: []
            };
            spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUser));

            component.fetchCurrentUser();

            expect(component.currentUser).toEqual(mockUser);
        });

        it('should handle user without _id', () => {
            const mockUser = { id: '123', username: 'testuser' };
            spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUser));

            component.fetchCurrentUser();

            expect(component.currentUser?._id).toBe('123');
        });

    });

    describe('fetchForum', () => {
        it('should fetch forum and related data when forum exists', () => {
            const mockForum = {
                _id: '1',
                user_id: 'user1',
                title: 'Test Forum',
                content: 'This is a test forum content.',
                categories: ['test', 'forum'],
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            mockForumService.getForumById.and.returnValue(of(mockForum));
            spyOn(component, 'fetchUser');
            spyOn(component, 'fetchComments');

            component.fetchForum('1');

            expect(component.forum).toEqual({
                ...mockForum,
                createdAt: jasmine.any(Date),
                updatedAt: jasmine.any(Date)
            });
            expect(component.originalForum).toEqual({
                ...mockForum,
                createdAt: jasmine.any(Date),
                updatedAt: jasmine.any(Date)
            });
            expect(component.fetchUser).toHaveBeenCalledWith('user1');
            expect(component.fetchComments).toHaveBeenCalledWith('1');
        });

        it('should redirect to forums list when forum not found', fakeAsync(() => {
            mockForumService.getForumById.and.returnValue(of(null as unknown as Forum));

            component.fetchForum('1');
            tick();

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/forum']);
        }));

        it('should handle error when fetching forum', () => {
            mockForumService.getForumById.and.returnValue(throwError('Error'));
            spyOn(console, 'error');

            component.fetchForum('1');

            expect(console.error).toHaveBeenCalledWith('Error fetching forum:', 'Error');
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/forum']);
        });
    });

    describe('deleteForum', () => {
        it('should delete forum when confirmed', async () => {
            const forumId = '1';
            mockConfirmationDialogService.confirm.and.returnValue(Promise.resolve(true));
            mockForumService.deleteForum.and.returnValue(of(undefined));
            spyOn(history, 'replaceState');

            await component.deleteForum(forumId);

            expect(mockConfirmationDialogService.confirm).toHaveBeenCalledWith(
                'Confirm Deletion',
                'Are you sure you want to delete this forum post?'
            );
            expect(mockForumService.deleteForum).toHaveBeenCalledWith(forumId);
            expect(history.replaceState).toHaveBeenCalledWith(null, '', '/forum');
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/forum']);
        });

        it('should not delete forum when not confirmed', async () => {
            const forumId = '1';
            mockConfirmationDialogService.confirm.and.returnValue(Promise.resolve(false));

            await component.deleteForum(forumId);

            expect(mockConfirmationDialogService.confirm).toHaveBeenCalled();
            expect(mockForumService.deleteForum).not.toHaveBeenCalled();
            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });

        it('should handle error when deleting forum', async () => {
            const forumId = '1';
            const error = new Error('Delete error');
            mockConfirmationDialogService.confirm.and.returnValue(Promise.resolve(true));
            mockForumService.deleteForum.and.returnValue(throwError(error));
            spyOn(console, 'error');

            await component.deleteForum(forumId);

            expect(mockForumService.deleteForum).toHaveBeenCalledWith(forumId);
            expect(console.error).toHaveBeenCalledWith('Error deleting forum:', error);
            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });
    });

    describe('toggleEditMode', () => {
        it('should toggle edit mode and save changes when exiting edit mode', () => {
            spyOn(component, 'saveForumChanges');
            component.isEditMode = false;

            component.toggleEditMode();

            expect(component.isEditMode).toBeTrue();

            component.toggleEditMode();

            expect(component.isEditMode).toBeFalse();
            expect(component.saveForumChanges).toHaveBeenCalled();
        });
    });

    describe('saveForumChanges', () => {
        it('should update forum when valid', () => {
            component.forum = {
                _id: '1',
                user_id: 'user1',
                title: 'Updated Forum',
                content: 'This is the updated content of the forum.',
                categories: ['updated', 'forum'],
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            spyOn(component, 'hasFormErrors').and.returnValue(false);
            mockForumService.updateForum.and.returnValue(of(component.forum));

            component.saveForumChanges();

            expect(mockForumService.updateForum).toHaveBeenCalledWith('1', component.forum);
            expect(component.isEditMode).toBeFalse();
            expect(component.formSubmitted).toBeFalse();
        });

        it('should not update forum when form has errors', () => {
            component.forum = {
                _id: '1',
                user_id: 'user1',
                title: 'Updated Forum',
                content: 'This is the updated content of the forum.',
                categories: ['updated', 'forum'],
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            spyOn(component, 'hasFormErrors').and.returnValue(true);

            component.saveForumChanges();

            expect(mockForumService.updateForum).not.toHaveBeenCalled();
        });

        it('should handle error when updating forum', () => {
            component.forum = {
                _id: '1',
                user_id: 'user1',
                title: 'Updated Forum',
                content: 'This is the updated content of the forum.',
                categories: ['updated', 'forum'],
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            spyOn(component, 'hasFormErrors').and.returnValue(false);
            mockForumService.updateForum.and.returnValue(throwError('Error'));
            spyOn(console, 'error');

            component.saveForumChanges();

            expect(console.error).toHaveBeenCalledWith('Error updating forum:', 'Error');
            expect(component.formSubmitted).toBeFalse();
        });
    });

    describe('cancelEdit', () => {
        it('should revert changes and exit edit mode', () => {
            const currentDate = new Date();
            component.forum = {
                _id: '1',
                user_id: 'user1',
                title: 'Changed Title',
                content: 'This is the updated content of the forum.',
                categories: ['updated', 'forum'],
                comments: [],
                createdAt: currentDate,
                updatedAt: currentDate
            };
            component.originalForum = {
                _id: '1',
                user_id: 'user1',
                title: 'Original Title',
                content: 'This is the original content of the forum.',
                categories: ['original', 'forum'],
                comments: [],
                createdAt: currentDate,
                updatedAt: currentDate
            };
            component.isEditMode = true;

            component.cancelEdit();

            expect(component.forum).toEqual(component.originalForum);
            expect(component.isEditMode).toBeFalse();
        });
    });

    describe('fetchUser', () => {
        it('should fetch user details', () => {
            const mockUser: User = {
                _id: 'user1',
                id: 'user1',
                username: 'TestUser',
                email: 'testuser@example.com',
                isVerified: true,
                following: [],
                followers: []
            };
            mockUserService.getUserById.and.returnValue(of(mockUser));

            component.fetchUser('user1');

            expect(component.user).toEqual(mockUser);
        });

        it('should handle error when fetching user', () => {
            mockUserService.getUserById.and.returnValue(throwError('Error'));
            spyOn(console, 'error');

            component.fetchUser('user1');

            expect(console.error).toHaveBeenCalledWith('Error fetching user:', 'Error');
        });
    });

    describe('getImageUrl', () => {
        it('should return default image when no image file', () => {
            expect(component.getImageUrl(null)).toBe('assets/garden-nexus-logo.webp');
        });

        it('should handle Buffer type image file', () => {
            const bufferImage = { type: 'Buffer', data: [1, 2, 3] };
            const result = component.getImageUrl(bufferImage);
            expect(result.startsWith('blob:')).toBeTrue();
        });

        it('should return string image file as is', () => {
            expect(component.getImageUrl('http://example.com/image.jpg')).toBe('http://example.com/image.jpg');
        });

        it('should cache image URLs', () => {
            const imageFile = { type: 'Buffer', data: [1, 2, 3] };
            const firstResult = component.getImageUrl(imageFile);
            const secondResult = component.getImageUrl(imageFile);
            expect(firstResult).toBe(secondResult);
        });
    });

    describe('fetchComments', () => {

        it('should handle error when fetching comments', () => {
            mockCommentService.getCommentsByForumId.and.returnValue(throwError('Error'));
            spyOn(console, 'error');

            component.fetchComments('1');

            expect(console.error).toHaveBeenCalledWith('Error fetching comments:', 'Error');
        });
    });

    describe('checkCommentLength', () => {
        it('should set isNewCommentTooLong to true when new comment exceeds max length', () => {
            component.newComment = 'a'.repeat(component.maxCommentLength + 1);
            component.checkCommentLength('new');
            expect(component.isNewCommentTooLong).toBeTrue();
        });

        it('should set isEditCommentTooLong to true when edit comment exceeds max length', () => {
            component.editCommentText = 'a'.repeat(component.maxCommentLength + 1);
            component.checkCommentLength('edit');
            expect(component.isEditCommentTooLong).toBeTrue();
        });
    });

    describe('addComment', () => {
        it('should add a new comment when valid', fakeAsync(() => {
            component.newComment = 'New comment';
            component.currentUser = {
                _id: 'user1',
                id: 'user1',
                username: 'User1',
                email: 'user1@example.com',
                isVerified: true,
                following: [],
                followers: []
            };
            component.forum = {
                _id: 'forum1',
                user_id: 'user1',
                title: 'Forum Title',
                content: 'This is the content of the forum.',
                categories: ['Category1', 'Category2'],
                createdAt: new Date(),
                updatedAt: new Date(),
                comments: []
            };
    
            const newComment = {
                _id: 'comment1',
                comment: 'New comment',
                user: component.currentUser,
                createdAt: new Date(),
                replyText: '',
                forumId: 'forum1'
            };
            mockCommentService.createComment.and.returnValue(of(newComment));
    
            component.addComment();
            tick(); // Wait for the Observable to complete
    
            expect(component.comments.length).toBe(1);
            expect(component.comments[0].comment).toBe('New comment');
            expect(component.newComment).toBe('');
        }));

        it('should not add comment when newComment is empty', () => {
            component.newComment = '';
            component.addComment();
            expect(mockCommentService.createComment).not.toHaveBeenCalled();
        });

        it('should handle error when adding comment', () => {
            component.newComment = 'New comment';
            component.currentUser = {
                _id: 'user1',
                id: 'user1',
                username: 'User1',
                email: 'user1@example.com',
                isVerified: true,
                following: [],
                followers: [],
                imageFile: 'image.jpg'
            };
            component.forum = {
                _id: 'forum1',
                user_id: 'user1',
                title: 'Forum Title',
                content: 'Forum content here',
                categories: ['Category1', 'Category2'],
                createdAt: new Date(),
                updatedAt: new Date(),
                comments: []
            };

            mockCommentService.createComment.and.returnValue(throwError('Error'));
            spyOn(console, 'error');

            component.addComment();

            expect(console.error).toHaveBeenCalledWith('Error adding comment:', 'Error');
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
        it('should set up the comment for editing', () => {
          const comment: Comment = {
            _id: '1',
            comment: 'Test comment',
            user: { _id: 'user1', username: 'testuser' },
            createdAt: new Date(),
            replyText: ''
          };
      
          component.editComment(comment);
      
          expect(component.commentBeingEdited).toEqual(comment);
          expect(component.editCommentText).toBe('Test comment');
          expect(component.isEditCommentTooLong).toBeFalse();
        });
      });
      
      describe('cancelEditComment', () => {
        it('should cancel the comment editing process', () => {
          component.commentBeingEdited = { _id: '1', comment: 'Test' } as Comment;
          component.editCommentText = 'Edited text';
          component.isEditCommentTooLong = true;
      
          component.cancelEditComment();
      
          expect(component.commentBeingEdited).toBeNull();
          expect(component.editCommentText).toBe('');
          expect(component.isEditCommentTooLong).toBeFalse();
        });
      });
      
      describe('saveEditedComment', () => {
        it('should not save when editCommentText is empty', () => {
          component.editCommentText = '  ';
          component.commentBeingEdited = { _id: '1', comment: 'Original' } as Comment;
      
          component.saveEditedComment();
      
          expect(mockCommentService.updateCommentById).not.toHaveBeenCalled();
        });
      
        it('should not save when commentBeingEdited is null', () => {
          component.editCommentText = 'Valid text';
          component.commentBeingEdited = null;
      
          component.saveEditedComment();
      
          expect(mockCommentService.updateCommentById).not.toHaveBeenCalled();
        });
      
        it('should not save when isEditCommentTooLong is true', () => {
          component.editCommentText = 'Valid text';
          component.commentBeingEdited = { _id: '1', comment: 'Original' } as Comment;
          component.isEditCommentTooLong = true;
      
          component.saveEditedComment();
      
          expect(mockCommentService.updateCommentById).not.toHaveBeenCalled();
        });
      
        it('should update comment locally and in database when valid', fakeAsync(() => {
          const originalComment: Comment = {
            _id: '1',
            comment: 'Original comment',
            user: { _id: 'user1', username: 'testuser' },
            createdAt: new Date(),
            replyText: ''
          };
          component.comments = [originalComment];
          component.commentBeingEdited = originalComment;
          component.editCommentText = 'Edited comment';
          mockCommentService.updateCommentById.and.returnValue(of({ ...originalComment, comment: 'Edited comment' }));
      
          component.saveEditedComment();
          tick();
      
          expect(component.comments[0].comment).toBe('Edited comment ');
          expect(component.commentBeingEdited).toBeNull();
          expect(component.editCommentText).toBe('');
          expect(mockCommentService.updateCommentById).toHaveBeenCalledWith('1', jasmine.objectContaining({
            comment: 'Edited comment',
            isEdited: true
          }));
        }));
      
        it('should handle error when updating comment', fakeAsync(() => {
            const originalComment: Comment = {
              _id: '1',
              comment: 'Original comment',
              user: { _id: 'user1', username: 'testuser' },
              createdAt: new Date(),
              replyText: ''
            };
            component.comments = [originalComment];
            component.commentBeingEdited = originalComment;
            component.editCommentText = 'Edited comment';
            const error = new Error('Update failed');
            mockCommentService.updateCommentById.and.returnValue(throwError(() => error));
            spyOn(console, 'error');
            spyOn(component, 'fetchComments');
          
            component.forum = { _id: 'forum1' } as Forum;
          
            component.saveEditedComment();
            tick();
          
            expect(console.error).toHaveBeenCalledWith('Error editing comment:', error);
            expect(component.fetchComments).toHaveBeenCalledWith('forum1');
          }));
      });

      describe('goBack', () => {
        it('should navigate to profile when source is profile and username is available', () => {
          component.source = 'profile';
          component.username = 'testuser';
          component.goBack();
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile', 'testuser']);
        });
      
        it('should navigate to forum when source is not profile', () => {
          component.source = 'other';
          component.goBack();
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/forum']);
        });
      
        it('should navigate to forum when username is null', () => {
          component.source = 'profile';
          component.username = null;
          component.goBack();
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/forum']);
        });
      });
      
      describe('hasFormErrors', () => {
        beforeEach(() => {
          component.maxTitleLength = 100;
          component.minContentLength = 10;
          component.maxContentLength = 1000;
        });
      
        it('should return true when forum is null', () => {
          component.forum = null;
          expect(component.hasFormErrors()).toBeTrue();
        });
      
        it('should return true when title is too long', () => {
          component.forum = { title: 'a'.repeat(101), content: 'Valid content' } as Forum;
          expect(component.hasFormErrors()).toBeTrue();
        });
      
        it('should return true when content is too short', () => {
          component.forum = { title: 'Valid title', content: 'Short' } as Forum;
          expect(component.hasFormErrors()).toBeTrue();
        });
      
        it('should return true when content is too long', () => {
          component.forum = { title: 'Valid title', content: 'a'.repeat(1001) } as Forum;
          expect(component.hasFormErrors()).toBeTrue();
        });
      
        it('should return false when title and content are valid', () => {
          component.forum = { title: 'Valid title', content: 'Valid content'.repeat(5) } as Forum;
          expect(component.hasFormErrors()).toBeFalse();
        });
      });
      
      describe('toggleCategory', () => {
        beforeEach(() => {
          component.forum = { categories: ['Category1', 'Category2'] } as Forum;
        });
      
        it('should add category when it does not exist', () => {
          component.toggleCategory('Category3');
          expect(component.forum?.categories).toContain('Category3');
        });
      
        it('should remove category when it exists', () => {
          component.toggleCategory('Category1');
          expect(component.forum?.categories).not.toContain('Category1');
        });
      
        it('should do nothing when forum is null', () => {
          component.forum = null;
          component.toggleCategory('Category1');
          expect(component.forum).toBeNull();
        });
      });
      
      describe('currentUserMatchesCommentUser', () => {
        it('should return false when commentUser is null', () => {
          expect(component.currentUserMatchesCommentUser(null, { _id: '1' })).toBeFalse();
        });
      
        it('should return false when currentUser is null', () => {
          expect(component.currentUserMatchesCommentUser({ _id: '1' }, null)).toBeFalse();
        });
      
        it('should return true when IDs match', () => {
          expect(component.currentUserMatchesCommentUser({ _id: '1' }, { _id: '1' })).toBeTrue();
        });
      
        it('should return false when IDs do not match', () => {
          expect(component.currentUserMatchesCommentUser({ _id: '1' }, { _id: '2' })).toBeFalse();
        });
      
        it('should handle id property', () => {
          expect(component.currentUserMatchesCommentUser({ id: '1' }, { id: '1' })).toBeTrue();
        });
      
        it('should trim IDs', () => {
          expect(component.currentUserMatchesCommentUser({ _id: ' 1 ' }, { _id: '1' })).toBeTrue();
        });
      
        it('should handle missing comment user ID', () => {
          spyOn(console, 'warn');
          expect(component.currentUserMatchesCommentUser({}, { _id: '1' })).toBeFalse();
          expect(console.warn).toHaveBeenCalledWith('Comment user ID is missing');
        });
      });
      
      describe('quoteComment', () => {
        it('should set up reply with quoted comment', () => {
          const comment: Comment = { comment: 'Test comment' } as Comment;
          component.quoteComment(comment);
          expect(component.replyingToComment).toEqual(comment);
          expect(component.replyText).toBe('"Test comment"');
        });
      
        it('should focus and scroll to comment input', () => {
          const mockTextarea = {
            focus: jasmine.createSpy('focus'),
            scrollIntoView: jasmine.createSpy('scrollIntoView')
          };
          spyOn(document, 'querySelector').and.returnValue(mockTextarea as any);
      
          const comment: Comment = { comment: 'Test comment' } as Comment;
          component.quoteComment(comment);
      
          expect(document.querySelector).toHaveBeenCalledWith('.add-comment-section textarea');
          expect(mockTextarea.focus).toHaveBeenCalled();
          expect(mockTextarea.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
        });
      });
      
      describe('cancelReply', () => {
        it('should reset reply state', () => {
          component.replyingToComment = { comment: 'Test comment' } as Comment;
          component.replyText = 'Reply text';
      
          component.cancelReply();
      
          expect(component.replyingToComment).toBeNull();
          expect(component.replyText).toBe('');
        });
      });  
});