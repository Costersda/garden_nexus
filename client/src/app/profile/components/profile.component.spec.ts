import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../auth/services/auth.service';
import { BlogService } from '../../shared/services/blog.service';
import { ForumService } from '../../shared/services/forum.service';
import { UserService } from '../../shared/services/user.service';
import { ConfirmationDialogService } from '../../shared/modules/confirmation-dialog/confirmation-dialog.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../shared/types/user.interface';
import { Blog } from '../../shared/types/blog.interface';
import { Forum } from '../../shared/types/forum.interface';
import { CurrentUserInterface } from '../../auth/types/currentUser.interface';
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

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
    selector: 'app-forum-preview', template: '',
    standalone: false
})
class MockForumPreviewComponent {
    @Input() forum!: Forum;
}

@Component({
    selector: 'app-blog-preview', template: '',
    standalone: false
})
class MockBlogPreviewComponent {
    @Input() blog!: Blog;
}

describe('ProfileComponent', () => {
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let authServiceMock: jasmine.SpyObj<AuthService>;
    let blogServiceMock: jasmine.SpyObj<BlogService>;
    let forumServiceMock: jasmine.SpyObj<ForumService>;
    let userServiceMock: jasmine.SpyObj<UserService>;
    let routerMock: jasmine.SpyObj<Router>;
    let confirmationDialogServiceMock: ConfirmationDialogService;
    let matDialogMock: jasmine.SpyObj<MatDialog>;

    const mockNullUser: CurrentUserInterface = {
        id: '',
        username: '',
        token: '',
        email: '',
        isVerified: false
    };

    const toastrServiceMock = {
        success: jasmine.createSpy('success'),
        error: jasmine.createSpy('error'),
        info: jasmine.createSpy('info')
    };

    beforeEach(async () => {
        authServiceMock = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'logout']);
        authServiceMock.getCurrentUser.and.returnValue(of(mockNullUser));
        blogServiceMock = jasmine.createSpyObj('BlogService', ['getBlogsByUser']);
        forumServiceMock = jasmine.createSpyObj('ForumService', ['getForumsByUser']);
        userServiceMock = jasmine.createSpyObj('UserService', [
            'getProfileByUsername',
            'getCurrentUser',
            'followUser',
            'unfollowUser',
            'checkIfFollowing',
            'getFollowing',
            'resendVerificationEmail',
            'deleteProfile'
        ]);
        routerMock = jasmine.createSpyObj('Router', ['parseUrl', 'navigate', 'createUrlTree', 'serializeUrl'], {
            events: of(),
        });
        matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);

        confirmationDialogServiceMock = new ConfirmationDialogService(matDialogMock);
        spyOn(confirmationDialogServiceMock, 'confirm').and.callThrough();

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule],
            declarations: [
                ProfileComponent,
                MockToolbarComponent,
                MockNavbarComponent,
                MockFooterComponent,
                MockForumPreviewComponent,
                MockBlogPreviewComponent
            ],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: BlogService, useValue: blogServiceMock },
                { provide: ForumService, useValue: forumServiceMock },
                { provide: UserService, useValue: userServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ToastrService, useValue: toastrServiceMock },
                { provide: ConfirmationDialogService, useValue: confirmationDialogServiceMock },
                { provide: MatDialog, useValue: matDialogMock },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        paramMap: of(convertToParamMap({ username: 'testuser' })),
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ProfileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    })

    it('should fetch profile on init', fakeAsync(() => {
        const mockProfile: User = {
            _id: '1',
            id: '1',
            email: 'testuser@example.com',
            username: 'testuser',
            bio: 'A brief bio',
            imageFile: 'profile-pic-url',
            isVerified: true,
            following: [],
            followers: []
        };

        userServiceMock.getProfileByUsername.and.returnValue(of(mockProfile));
        blogServiceMock.getBlogsByUser.and.returnValue(of([]));
        forumServiceMock.getForumsByUser.and.returnValue(of([]));
        userServiceMock.getFollowing.and.returnValue(of([]));
        userServiceMock.checkIfFollowing.and.returnValue(of(false));

        component.ngOnInit();
        tick();

        expect(userServiceMock.getProfileByUsername).toHaveBeenCalledWith('testuser');
        expect(component.profile).toEqual(mockProfile);
    }));

    it('should check ownership on init', fakeAsync(() => {
        const mockCurrentUser: CurrentUserInterface = {
            id: '1',
            username: 'testuser',
            token: 'fake-token',
            email: 'testuser@example.com',
            isVerified: true
        };

        const mockProfile: User = {
            _id: '1',
            id: '1',
            email: 'testuser@example.com',
            username: 'testuser',
            bio: 'A brief bio',
            imageFile: 'profile-pic-url',
            isVerified: true,
            following: [],
            followers: []
        };

        authServiceMock.getCurrentUser.and.returnValue(of(mockCurrentUser));
        userServiceMock.getProfileByUsername.and.returnValue(of(mockProfile));
        blogServiceMock.getBlogsByUser.and.returnValue(of([]));
        forumServiceMock.getForumsByUser.and.returnValue(of([]));
        userServiceMock.getFollowing.and.returnValue(of([]));
        userServiceMock.checkIfFollowing.and.returnValue(of(false));

        component.ngOnInit();
        tick();

        expect(component.isOwner).toBeTrue();
    }));

    it('should handle error when checking ownership', fakeAsync(() => {
        authServiceMock.getCurrentUser.and.returnValue(throwError(() => new Error('Failed to get current user')));

        const mockProfile: User = {
            _id: '1',
            id: '1',
            email: 'testuser@example.com',
            username: 'testuser',
            bio: 'A brief bio',
            imageFile: 'profile-pic-url',
            isVerified: true,
            following: [],
            followers: []
        };

        userServiceMock.getProfileByUsername.and.returnValue(of(mockProfile));
        blogServiceMock.getBlogsByUser.and.returnValue(of([]));
        forumServiceMock.getForumsByUser.and.returnValue(of([]));
        userServiceMock.getFollowing.and.returnValue(of([]));
        userServiceMock.checkIfFollowing.and.returnValue(of(false));

        spyOn(console, 'error');

        component.ngOnInit();
        tick();
        fixture.detectChanges();

        expect(authServiceMock.getCurrentUser).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Error fetching current user:', jasmine.any(Error));
        expect(component.isOwner).toBeFalse();

        expect(component.profile).toEqual(mockProfile);
        expect(userServiceMock.getProfileByUsername).toHaveBeenCalledWith('testuser');
    }));

    it('should fetch blogs on init', fakeAsync(() => {
        const mockProfile: User = {
            _id: '1',
            id: '1',
            email: 'testuser@example.com',
            username: 'testuser',
            bio: 'A brief bio',
            imageFile: 'profile-pic-url',
            isVerified: true,
            following: [],
            followers: []
        };

        const mockBlogs: Blog[] = [
            {
                _id: '1',
                title: 'Test Blog',
                user_id: '1',
                content_section_1: 'Content section 1',
                image_1: 'image-url-1',
                categories: ['category1'],
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        userServiceMock.getProfileByUsername.and.returnValue(of(mockProfile));
        blogServiceMock.getBlogsByUser.and.returnValue(of(mockBlogs));
        forumServiceMock.getForumsByUser.and.returnValue(of([]));
        userServiceMock.getFollowing.and.returnValue(of([]));
        userServiceMock.checkIfFollowing.and.returnValue(of(false));

        component.ngOnInit();
        tick();

        expect(blogServiceMock.getBlogsByUser).toHaveBeenCalledWith('testuser');
        expect(component.blogs).toEqual(mockBlogs);
        expect(component.displayedBlogs.length).toBe(Math.min(3, mockBlogs.length));
    }));

    it('should fetch forums on init', fakeAsync(() => {
        const mockForums: Forum[] = [{
            _id: '1',
            title: 'Test Forum',
            user_id: '1',
            content: 'Content',
            categories: ['category1'],
            comments: [],
            isEdited: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }];
        userServiceMock.getProfileByUsername.and.returnValue(of({
            _id: '1',
            id: '1',
            email: 'testuser@example.com',
            username: 'testuser',
            bio: 'A brief bio',
            imageFile: 'profile-pic-url',
            isVerified: true,
            following: [],
            followers: []
        }));
        blogServiceMock.getBlogsByUser.and.returnValue(of([]));
        forumServiceMock.getForumsByUser.and.returnValue(of(mockForums));
        userServiceMock.getFollowing.and.returnValue(of([]));
        userServiceMock.checkIfFollowing.and.returnValue(of(false));

        component.ngOnInit();
        tick();

        expect(forumServiceMock.getForumsByUser).toHaveBeenCalledWith('testuser');
        expect(component.forums).toEqual(mockForums);
        expect(component.displayedForums.length).toBe(Math.min(3, mockForums.length));
    }));

    it('should fetch following on init', fakeAsync(() => {
        const mockProfile: User = {
            _id: '1',
            id: '1',
            email: 'testuser@example.com',
            username: 'testuser',
            bio: 'A brief bio',
            imageFile: 'profile-pic-url',
            isVerified: true,
            following: [],
            followers: []
        };

        const mockFollowing: User[] = [
            {
                _id: '2',
                id: '1',
                email: 'followeduser@example.com',
                username: 'followeduser',
                bio: 'Bio of followed user',
                imageFile: 'followed-user-pic-url',
                isVerified: true,
                following: [],
                followers: []
            }
        ];

        userServiceMock.getProfileByUsername.and.returnValue(of(mockProfile));
        blogServiceMock.getBlogsByUser.and.returnValue(of([]));
        forumServiceMock.getForumsByUser.and.returnValue(of([]));
        userServiceMock.getFollowing.and.returnValue(of(mockFollowing));
        userServiceMock.checkIfFollowing.and.returnValue(of(false));

        component.ngOnInit();
        tick();

        expect(userServiceMock.getFollowing).toHaveBeenCalledWith('1');
        expect(component.following).toEqual(mockFollowing);
        expect(component.displayedFollowing.length).toBe(Math.min(5, mockFollowing.length));
    }));

    it('should check if following on init', fakeAsync(() => {
        const mockCurrentUser: CurrentUserInterface = {
            id: '2',
            username: 'currentuser',
            token: 'fake-token',
            email: 'currentuser@example.com',
            isVerified: true
        };

        authServiceMock.getCurrentUser.and.returnValue(of(mockCurrentUser));

        userServiceMock.getProfileByUsername.and.returnValue(of({
            _id: '1',
            id: '1',
            email: 'testuser@example.com',
            username: 'testuser',
            bio: 'A brief bio',
            imageFile: 'profile-pic-url',
            isVerified: true,
            following: [],
            followers: []
        }));

        blogServiceMock.getBlogsByUser.and.returnValue(of([]));
        forumServiceMock.getForumsByUser.and.returnValue(of([]));
        userServiceMock.getFollowing.and.returnValue(of([]));
        userServiceMock.checkIfFollowing.and.returnValue(of(true));

        component.ngOnInit();
        tick();

        expect(authServiceMock.getCurrentUser).toHaveBeenCalled();
        expect(userServiceMock.checkIfFollowing).toHaveBeenCalledWith('1');
        expect(component.isFollowing).toBeTrue();
        expect(component.isOwner).toBeFalse();
    }));

    describe('ngOnDestroy', () => {
        it('should unsubscribe from routeSubscription and blogSubscription if they exist', () => {
            const routeSubscriptionSpy = jasmine.createSpyObj('Subscription', ['unsubscribe']);
            const blogSubscriptionSpy = jasmine.createSpyObj('Subscription', ['unsubscribe']);

            component.routeSubscription = routeSubscriptionSpy;
            component.blogSubscription = blogSubscriptionSpy;

            component.ngOnDestroy();

            expect(routeSubscriptionSpy.unsubscribe).toHaveBeenCalled();
            expect(blogSubscriptionSpy.unsubscribe).toHaveBeenCalled();
        });

        it('should not throw an error if subscriptions are undefined', () => {
            component.routeSubscription = undefined;
            component.blogSubscription = undefined;

            expect(() => component.ngOnDestroy()).not.toThrow();
        });
    });

    describe('onClickOutside', () => {
        it('should set showBlogDropdown to false', () => {
            component.showBlogDropdown = true;
            const mockEvent = new MouseEvent('click');

            component.onClickOutside(mockEvent);

            expect(component.showBlogDropdown).toBeFalse();
        });
    });

    describe('fetchProfile', () => {
        it('should fetch profile and update component properties', () => {
            const mockProfile: User = {
                _id: '1',
                id: '1',
                email: 'testuser@example.com',
                username: 'testuser',
                bio: 'A brief bio',
                imageFile: 'profile-pic-url',
                isVerified: true,
                following: [],
                followers: []
            };

            userServiceMock.getProfileByUsername.and.returnValue(of(mockProfile));
            spyOn(component, 'checkIfFollowing');
            spyOn(component, 'fetchFollowing');

            component.fetchProfile('testuser');

            expect(component.profile).toEqual(mockProfile);
            expect(component.errorMessage).toBeNull();
            expect(component.checkIfFollowing).toHaveBeenCalled();
            expect(component.fetchFollowing).toHaveBeenCalled();
        });

        it('should handle error when fetching profile', () => {
            userServiceMock.getProfileByUsername.and.returnValue(throwError(() => new Error('Profile fetch error')));

            component.fetchProfile('testuser');

            expect(component.errorMessage).toBe('Error fetching profile');
        });
    });

    describe('checkOwnership', () => {
        it('should set isOwner to true when current user matches profile username', () => {
            const mockCurrentUser: CurrentUserInterface = { username: 'testuser' } as CurrentUserInterface;
            authServiceMock.getCurrentUser.and.returnValue(of(mockCurrentUser));

            component.checkOwnership('testuser');

            expect(component.isOwner).toBeTrue();
        });

        it('should set isOwner to false when current user does not match profile username', () => {
            const mockCurrentUser: CurrentUserInterface = { username: 'otheruser' } as CurrentUserInterface;
            authServiceMock.getCurrentUser.and.returnValue(of(mockCurrentUser));

            component.checkOwnership('testuser');

            expect(component.isOwner).toBeFalse();
        });

        it('should handle error when fetching current user', () => {
            authServiceMock.getCurrentUser.and.returnValue(throwError(() => new Error('Current user fetch error')));

            component.checkOwnership('testuser');

            expect(component.isOwner).toBeFalse();
        });
    });

    describe('fetchBlogsByUser', () => {
        it('should fetch, sort blogs, and update displayedBlogs', () => {
            const mockBlogs: Blog[] = [
                {
                    _id: '1',
                    user_id: 'testuser_id',
                    title: 'Blog 1',
                    content_section_1: 'Content 1',
                    image_1: 'image1-url',
                    categories: ['category1'],
                    comments: [],
                    createdAt: new Date('2023-01-02'),
                    updatedAt: new Date('2023-01-02')
                },
                {
                    _id: '2',
                    user_id: 'testuser_id',
                    title: 'Blog 2',
                    content_section_1: 'Content 2',
                    image_1: 'image2-url',
                    categories: ['category2'],
                    comments: [],
                    createdAt: new Date('2023-01-01'),
                    updatedAt: new Date('2023-01-01')
                },
                {
                    _id: '3',
                    user_id: 'testuser_id',
                    title: 'Blog 3',
                    content_section_1: 'Content 3',
                    image_1: 'image3-url',
                    categories: ['category3'],
                    comments: [],
                    createdAt: new Date('2023-01-03'),
                    updatedAt: new Date('2023-01-03')
                }
            ];

            blogServiceMock.getBlogsByUser.and.returnValue(of(mockBlogs));

            component.fetchBlogsByUser('testuser');

            expect(component.blogs.length).toBe(3);
            expect(component.blogs[0]._id).toBe('3');
            expect(component.blogs[1]._id).toBe('1');
            expect(component.blogs[2]._id).toBe('2');

            expect(component.displayedBlogs.length).toBeGreaterThan(0);
            expect(component.displayedBlogs.length).toBeLessThanOrEqual(component.blogs.length);

            expect(component.displayedBlogs[0]._id).toBe('3');
        });

        it('should handle error when fetching blogs', () => {
            const error = new Error('Blog fetch error');
            blogServiceMock.getBlogsByUser.and.returnValue(throwError(() => error));
            spyOn(console, 'error');

            component.fetchBlogsByUser('testuser');

            expect(console.error).toHaveBeenCalledWith('Error fetching blogs by user:', error);
        });
    });

    describe('viewBlog', () => {
        it('should navigate to blog page with correct parameters when blogId and profile username are available', () => {
            const blogId = '123';
            const mockProfile: User = {
                _id: '1',
                id: '1',
                email: 'testuser@example.com',
                username: 'testuser',
                bio: 'A brief bio',
                imageFile: 'profile-pic-url',
                isVerified: true,
                following: [],
                followers: []
            };

            component.profile = mockProfile;

            component.viewBlog(blogId);

            expect(routerMock.navigate).toHaveBeenCalledWith(
                ['/blog', blogId],
                { queryParams: { source: 'profile', username: 'testuser' } }
            );
        });

        it('should not navigate when blogId is undefined', () => {
            const mockProfile: User = {
                _id: '1',
                id: '1',
                email: 'testuser@example.com',
                username: 'testuser',
                bio: 'A brief bio',
                imageFile: 'profile-pic-url',
                isVerified: true,
                following: [],
                followers: []
            };

            component.viewBlog(undefined);

            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should not navigate when profile username is undefined', () => {
            const blogId = '123';
            component.profile = null;

            component.viewBlog(blogId);

            expect(routerMock.navigate).not.toHaveBeenCalled();
        });
    });

    describe('fetchForumsByUser', () => {
        it('should fetch, sort forums, and update displayedForums', () => {
            const mockForums: Forum[] = [
                { _id: '1', createdAt: new Date('2023-01-02') },
                { _id: '2', createdAt: new Date('2023-01-01') },
                { _id: '3', createdAt: new Date('2023-01-03') }
            ] as Forum[];

            forumServiceMock.getForumsByUser.and.returnValue(of(mockForums));

            component.fetchForumsByUser('testuser');

            expect(component.forums.length).toBe(3);
            expect(component.forums[0]._id).toBe('3');
            expect(component.displayedForums.length).toBeGreaterThan(0);
            expect(component.displayedForums.length).toBeLessThanOrEqual(component.forums.length);
            expect(component.displayedForums[0]._id).toBe('3');
        });

        it('should handle error when fetching forums', () => {
            const error = new Error('Forum fetch error');
            forumServiceMock.getForumsByUser.and.returnValue(throwError(() => error));
            spyOn(console, 'error');

            component.fetchForumsByUser('testuser');

            expect(console.error).toHaveBeenCalledWith('Error fetching forums by user:', error);
        });
    });

    describe('loadMoreForums', () => {
        it('should load more forums', () => {
            component.forums = [
                { _id: '1', title: 'Forum 1' },
                { _id: '2', title: 'Forum 2' },
                { _id: '3', title: 'Forum 3' },
                { _id: '4', title: 'Forum 4' },
                { _id: '5', title: 'Forum 5' }
            ] as Forum[];
            component.displayedForums = [
                { _id: '1', title: 'Forum 1' },
                { _id: '2', title: 'Forum 2' }
            ] as Forum[];

            const initialLength = component.displayedForums.length;

            component.loadMoreForums();

            expect(component.displayedForums.length).toBeGreaterThan(initialLength);
            expect(component.displayedForums.length).toBeLessThanOrEqual(component.forums.length);

            expect(component.displayedForums).toContain(jasmine.objectContaining({ _id: '3' }));

            expect(component.displayedForums[0]._id).toBe('1');
            expect(component.displayedForums[1]._id).toBe('2');
        });

        it('should not exceed total forums when loading more', () => {
            component.forums = [
                { _id: '1', title: 'Forum 1' },
                { _id: '2', title: 'Forum 2' }
            ] as Forum[];
            component.displayedForums = [
                { _id: '1', title: 'Forum 1' },
                { _id: '2', title: 'Forum 2' }
            ] as Forum[];

            component.loadMoreForums();

            expect(component.displayedForums.length).toBe(component.forums.length);
        });
    });

    describe('viewForum', () => {
        it('should navigate to forum page with correct parameters when forumId and profile username are available', () => {
            const forumId = '123';
            component.profile = {
                _id: '1',
                id: '1',
                email: 'testuser@example.com',
                username: 'testuser',
                bio: 'A brief bio',
                imageFile: 'profile-pic-url',
                isVerified: true,
                following: [],
                followers: []
            };

            component.viewForum(forumId);

            expect(routerMock.navigate).toHaveBeenCalledWith(
                ['/forum', forumId],
                { queryParams: { source: 'profile', username: 'testuser' } }
            );
        });

        it('should not navigate when forumId is undefined', () => {
            component.profile = {
                _id: '1',
                id: '1',
                email: 'testuser@example.com',
                username: 'testuser',
                bio: 'A brief bio',
                imageFile: 'profile-pic-url',
                isVerified: true,
                following: [],
                followers: []
            };

            component.viewForum(undefined);

            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should not navigate when profile username is undefined', () => {
            const forumId = '123';
            component.profile = null;

            component.viewForum(forumId);

            expect(routerMock.navigate).not.toHaveBeenCalled();
        });
    });

    describe('openEditProfileModal', () => {
        it('should open modal when user is the owner', () => {
            component.isOwner = true;
            component.isModalOpen = false;

            component.openEditProfileModal();

            expect(component.isModalOpen).toBeTrue();
        });

        it('should navigate to login when user is not the owner', () => {
            component.isOwner = false;

            component.openEditProfileModal();

            expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
        });
    });

    describe('toggleBlogDropdown', () => {
        it('should toggle showBlogDropdown and stop event propagation', () => {
            const mockEvent = jasmine.createSpyObj('MouseEvent', ['stopPropagation']);
            component.showBlogDropdown = false;

            component.toggleBlogDropdown(mockEvent);

            expect(mockEvent.stopPropagation).toHaveBeenCalled();
            expect(component.showBlogDropdown).toBeTrue();

            component.toggleBlogDropdown(mockEvent);

            expect(component.showBlogDropdown).toBeFalse();
        });
    });

    describe('deleteProfile', () => {
        it('should delete profile and navigate to home on confirmation', fakeAsync(() => {
          component.profile = { email: 'test@example.com' } as User;
      
          const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true) });
          matDialogMock.open.and.returnValue(dialogRefSpyObj);
      
          userServiceMock.deleteProfile.and.returnValue(of(null));
      
          component.deleteProfile();
          tick();
      
          expect(matDialogMock.open).toHaveBeenCalled();
          expect(userServiceMock.deleteProfile).toHaveBeenCalled();
          expect(authServiceMock.logout).toHaveBeenCalled();
          expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
        }));
      
        it('should not delete profile on cancellation', fakeAsync(() => {
          component.profile = { email: 'test@example.com' } as User;
      
          const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(false) });
          matDialogMock.open.and.returnValue(dialogRefSpyObj);
      
          component.deleteProfile();
          tick();
      
          expect(matDialogMock.open).toHaveBeenCalled();
          expect(userServiceMock.deleteProfile).not.toHaveBeenCalled();
        }));
    
        it('should handle error when deleting profile', fakeAsync(() => {
            component.profile = { email: 'test@example.com' } as User;
        
            const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true) });
            matDialogMock.open.and.returnValue(dialogRefSpyObj);
        
            userServiceMock.deleteProfile.and.returnValue(throwError(() => new Error('Delete error')));
        
            spyOn(console, 'error');
        
            component.deleteProfile();
            tick();
        
            expect(matDialogMock.open).toHaveBeenCalled();
            expect(userServiceMock.deleteProfile).toHaveBeenCalled();
            expect(console.error).toHaveBeenCalledWith('Error deleting profile:', jasmine.any(Error));
            expect(component.errorMessage).toBe('Failed to delete profile. Please try again.');
          }));
    
        it('should show error when profile is not available', fakeAsync(() => {
            component.profile = null;
    
            component.deleteProfile();
            tick();
    
            expect(toastrServiceMock.error).toHaveBeenCalledWith('User profile not available');
        }));
    });

    describe('resendVerificationEmail', () => {
        let consoleErrorSpy: jasmine.Spy;

        beforeEach(() => {
            consoleErrorSpy = spyOn(console, 'error');
            spyOn(component, 'fetchProfile').and.callFake(() => { });
        });

        it('should send verification email when cooldown period has passed', fakeAsync(() => {
            component.profile = { email: 'test@example.com', username: 'testuser' } as any;

            let currentTime = 1000000;
            jasmine.clock().mockDate(new Date(currentTime));

            userServiceMock.resendVerificationEmail.and.returnValue(of({}));

            component.resendVerificationEmail();
            tick();
            expect(userServiceMock.resendVerificationEmail).toHaveBeenCalled();
            expect(toastrServiceMock.success).toHaveBeenCalledWith('Verification email sent successfully. Please check your inbox.');

            userServiceMock.resendVerificationEmail.calls.reset();
            toastrServiceMock.success.calls.reset();

            jasmine.clock().tick(120000);

            component.resendVerificationEmail();
            tick();

            expect(userServiceMock.resendVerificationEmail).toHaveBeenCalledWith('test@example.com');
            expect(toastrServiceMock.success).toHaveBeenCalledWith('Verification email sent successfully. Please check your inbox.');
        }));

        it('should not send verification email during cooldown period', fakeAsync(() => {
            component.profile = { email: 'test@example.com', username: 'testuser' } as any;

            let currentTime = 1000000;
            jasmine.clock().mockDate(new Date(currentTime));

            userServiceMock.resendVerificationEmail.and.returnValue(of({}));

            component.resendVerificationEmail();
            tick();
            expect(userServiceMock.resendVerificationEmail).toHaveBeenCalled();

            userServiceMock.resendVerificationEmail.calls.reset();

            jasmine.clock().tick(30000);

            component.resendVerificationEmail();
            tick();

            expect(userServiceMock.resendVerificationEmail).not.toHaveBeenCalled();
            expect(toastrServiceMock.info).toHaveBeenCalledWith(jasmine.stringMatching(/Please wait \d+ seconds before requesting another email./));
        }));

        it('should handle error when sending verification email', fakeAsync(() => {
            component.profile = { email: 'test@example.com' } as any;

            userServiceMock.resendVerificationEmail.and.returnValue(throwError(() => new Error('Email error')));

            component.resendVerificationEmail();
            tick();

            expect(consoleErrorSpy).toHaveBeenCalledWith('Error resending verification email', jasmine.any(Error));
            expect(toastrServiceMock.error).toHaveBeenCalledWith('Failed to send verification email. Please try again later.');
        }));

        it('should show error if profile is not available', () => {
            component.profile = null;
            component.resendVerificationEmail();
            expect(toastrServiceMock.error).toHaveBeenCalledWith('User profile not available');
        });
    });

    describe('loadMoreFollowing', () => {
        it('should load more following users', () => {
            const mockUsers: User[] = [
                { id: '1', _id: '1', email: 'user1@example.com', username: 'user1', bio: 'Bio 1', imageFile: 'url1', isVerified: true, following: [], followers: [] },
                { id: '2', _id: '2', email: 'user2@example.com', username: 'user2', bio: 'Bio 2', imageFile: 'url2', isVerified: true, following: [], followers: [] },
                { id: '3', _id: '3', email: 'user3@example.com', username: 'user3', bio: 'Bio 3', imageFile: 'url3', isVerified: true, following: [], followers: [] },
                { id: '4', _id: '4', email: 'user4@example.com', username: 'user4', bio: 'Bio 4', imageFile: 'url4', isVerified: true, following: [], followers: [] },
                { id: '5', _id: '5', email: 'user5@example.com', username: 'user5', bio: 'Bio 5', imageFile: 'url5', isVerified: true, following: [], followers: [] }
            ];

            // Set the initial state
            component.following = mockUsers;
            component.displayedFollowing = mockUsers.slice(0, 2);

            // Call loadMoreFollowing once
            component.loadMoreFollowing();

            // Check if more users are loaded
            expect(component.displayedFollowing.length).toBeGreaterThan(2);
            expect(component.displayedFollowing.length).toBeLessThanOrEqual(5);

            // Verify that the displayed users are in the correct order
            expect(component.displayedFollowing.map(u => u.username)).toEqual(
                jasmine.arrayContaining(['user1', 'user2', 'user3', 'user4', 'user5'].slice(0, component.displayedFollowing.length))
            );
        });

        it('should not exceed the total number of following users', () => {
            const mockUsers: User[] = [
                { id: '1', _id: '1', email: 'user1@example.com', username: 'user1', bio: 'Bio 1', imageFile: 'url1', isVerified: true, following: [], followers: [] },
                { id: '2', _id: '2', email: 'user2@example.com', username: 'user2', bio: 'Bio 2', imageFile: 'url2', isVerified: true, following: [], followers: [] },
                { id: '3', _id: '3', email: 'user3@example.com', username: 'user3', bio: 'Bio 3', imageFile: 'url3', isVerified: true, following: [], followers: [] },
            ];

            // Set the initial state
            component.following = mockUsers;
            component.displayedFollowing = mockUsers.slice(0, 2);

            // Call loadMoreFollowing multiple times
            component.loadMoreFollowing();
            component.loadMoreFollowing();
            component.loadMoreFollowing();

            // Check if it doesn't exceed the total number of following users
            expect(component.displayedFollowing.length).toBe(3);
            expect(component.displayedFollowing.map(u => u.username)).toEqual(['user1', 'user2', 'user3']);
        });

        it('should not exceed the total number of following users', () => {
            const mockUsers: User[] = [
                {
                    _id: '1', id: '1', email: 'user1@example.com', username: 'user1',
                    bio: 'Bio 1', imageFile: 'url1', isVerified: true, following: [], followers: []
                },
                {
                    _id: '2', id: '2', email: 'user2@example.com', username: 'user2',
                    bio: 'Bio 2', imageFile: 'url2', isVerified: true, following: [], followers: []
                },
                {
                    _id: '3', id: '3', email: 'user3@example.com', username: 'user3',
                    bio: 'Bio 3', imageFile: 'url3', isVerified: true, following: [], followers: []
                }
            ];

            component.following = mockUsers;
            component.displayedFollowing = mockUsers.slice(0, 2);

            component.loadMoreFollowing();
            component.loadMoreFollowing();
            component.loadMoreFollowing();

            expect(component.displayedFollowing.length).toBe(3);
            expect(component.displayedFollowing.map(u => u.username)).toEqual(['user1', 'user2', 'user3']);
        });
    });

    describe('toggleFollow', () => {
        it('should call unfollowUser when isFollowing is true', () => {
            component.isFollowing = true;
            spyOn(component, 'unfollowUser');
            spyOn(component, 'followUser');

            component.toggleFollow();

            expect(component.unfollowUser).toHaveBeenCalled();
            expect(component.followUser).not.toHaveBeenCalled();
        });

        it('should call followUser when isFollowing is false', () => {
            component.isFollowing = false;
            spyOn(component, 'unfollowUser');
            spyOn(component, 'followUser');

            component.toggleFollow();

            expect(component.followUser).toHaveBeenCalled();
            expect(component.unfollowUser).not.toHaveBeenCalled();
        });
    });

    describe('fetchFollowing', () => {
        it('should fetch following users when profile exists', () => {
            const mockFollowing: User[] = [
                {
                    _id: '1',
                    id: '1',
                    email: 'user1@example.com',
                    username: 'user1',
                    bio: 'Bio 1',
                    imageFile: 'url1',
                    isVerified: true,
                    following: [],
                    followers: []
                },
                {
                    _id: '2',
                    id: '2',
                    email: 'user2@example.com',
                    username: 'user2',
                    bio: 'Bio 2',
                    imageFile: 'url2',
                    isVerified: true,
                    following: [],
                    followers: []
                }
            ];
            component.profile = { id: 'testId' } as any;
            userServiceMock.getFollowing.and.returnValue(of(mockFollowing));
    
            component.fetchFollowing();
    
            expect(userServiceMock.getFollowing).toHaveBeenCalledWith('testId');
            expect(component.following).toEqual(mockFollowing);
            expect(component.displayedFollowing.length).toBeLessThanOrEqual(mockFollowing.length);
            expect(component.isLoadingFollowing).toBeFalse();
        });
    
        it('should handle error when fetching following users fails', () => {
          component.profile = { id: 'testId' } as any;
          userServiceMock.getFollowing.and.returnValue(throwError(() => new Error('API error')));
    
          component.fetchFollowing();
    
          expect(userServiceMock.getFollowing).toHaveBeenCalledWith('testId');
          expect(component.errorMessage).toBe('Failed to fetch following users. Please try again.');
          expect(component.isLoadingFollowing).toBeFalse();
        });
    
        it('should not fetch following users when profile does not exist', () => {
          component.profile = null;
    
          component.fetchFollowing();
    
          expect(userServiceMock.getFollowing).not.toHaveBeenCalled();
        });
      });
    
      describe('checkIfFollowing', () => {
        it('should check if user is following when profile exists', () => {
          component.profile = { id: 'testId' } as any;
          userServiceMock.checkIfFollowing.and.returnValue(of(true));
    
          component.checkIfFollowing();
    
          expect(userServiceMock.checkIfFollowing).toHaveBeenCalledWith('testId');
          expect(component.isFollowing).toBeTrue();
        });
    
        it('should handle error when checking if following fails', () => {
          component.profile = { id: 'testId' } as any;
          userServiceMock.checkIfFollowing.and.returnValue(throwError(() => new Error('API error')));
    
          component.checkIfFollowing();
    
          expect(userServiceMock.checkIfFollowing).toHaveBeenCalledWith('testId');
          expect(component.isFollowing).toBeFalse(); 
        });
    
        it('should not check if following when profile does not exist', () => {
          component.profile = null;
    
          component.checkIfFollowing();
    
          expect(userServiceMock.checkIfFollowing).not.toHaveBeenCalled();
        });
      });
    
      describe('followUser', () => {
        it('should follow user when profile exists', () => {
          component.profile = { id: 'testId' } as any;
          userServiceMock.followUser.and.returnValue(of(null));
    
          component.followUser();
    
          expect(userServiceMock.followUser).toHaveBeenCalledWith('testId');
          expect(component.isFollowing).toBeTrue();
        });
    
        it('should handle error when following user fails', () => {
          component.profile = { id: 'testId' } as any;
          userServiceMock.followUser.and.returnValue(throwError(() => new Error('API error')));
    
          component.followUser();
    
          expect(userServiceMock.followUser).toHaveBeenCalledWith('testId');
          expect(component.errorMessage).toBe('Failed to follow user. Please try again.');
        });
    
        it('should not follow user when profile does not exist', () => {
          component.profile = null;
    
          component.followUser();
    
          expect(userServiceMock.followUser).not.toHaveBeenCalled();
          expect(component.errorMessage).toBe('Unable to follow user. Profile ID is missing.');
        });
      });
    
      describe('unfollowUser', () => {
        it('should unfollow user when profile exists', () => {
          component.profile = { id: 'testId' } as any;
          userServiceMock.unfollowUser.and.returnValue(of(null));
    
          component.unfollowUser();
    
          expect(userServiceMock.unfollowUser).toHaveBeenCalledWith('testId');
          expect(component.isFollowing).toBeFalse();
        });
    
        it('should handle error when unfollowing user fails', () => {
          component.profile = { id: 'testId' } as any;
          userServiceMock.unfollowUser.and.returnValue(throwError(() => new Error('API error')));
    
          component.unfollowUser();
    
          expect(userServiceMock.unfollowUser).toHaveBeenCalledWith('testId');
          expect(component.errorMessage).toBe('Failed to unfollow user. Please try again.');
        });
    
        it('should not unfollow user when profile does not exist', () => {
          component.profile = null;
    
          component.unfollowUser();
    
          expect(userServiceMock.unfollowUser).not.toHaveBeenCalled();
          expect(component.errorMessage).toBe('Unable to unfollow user. Profile ID is missing.');
        });
      });
});
