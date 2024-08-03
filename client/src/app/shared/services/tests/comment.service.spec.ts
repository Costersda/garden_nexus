import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CommentService } from '../comment.service';
import { Comment } from '../../types/comment.interface';
import { environment } from '../../../../environments/environment';

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/comments`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommentService]
    });
    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createComment', () => {
    it('should create a comment', () => {
      const mockComment: Comment = {
        user: { _id: '1', username: 'testUser' },
        comment: 'Test comment',
        createdAt: new Date(),
        replyText: ''
      };

      service.createComment(mockComment).subscribe(comment => {
        expect(comment).toEqual(mockComment);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush(mockComment);
    });
  });

  describe('getCommentsByBlogId', () => {
    it('should retrieve comments for a blog', () => {
      const mockComments: Comment[] = [
        { user: { _id: '1', username: 'user1' }, comment: 'Comment 1', createdAt: new Date(), replyText: '' },
        { user: { _id: '2', username: 'user2' }, comment: 'Comment 2', createdAt: new Date(), replyText: '' }
      ];
      const blogId = 'blog123';

      service.getCommentsByBlogId(blogId).subscribe(comments => {
        expect(comments).toEqual(mockComments);
      });

      const req = httpMock.expectOne(`${apiUrl}/blog/${blogId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockComments);
    });
  });

  describe('getCommentsByForumId', () => {
    it('should retrieve comments for a forum', () => {
      const mockComments: Comment[] = [
        { user: { _id: '1', username: 'user1' }, comment: 'Comment 1', createdAt: new Date(), replyText: '' },
        { user: { _id: '2', username: 'user2' }, comment: 'Comment 2', createdAt: new Date(), replyText: '' }
      ];
      const forumId = 'forum123';

      service.getCommentsByForumId(forumId).subscribe(comments => {
        expect(comments).toEqual(mockComments);
      });

      const req = httpMock.expectOne(`${apiUrl}/forum/${forumId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockComments);
    });
  });

  describe('getCommentById', () => {
    it('should retrieve a comment by id', () => {
      const mockComment: Comment = {
        user: { _id: '1', username: 'testUser' },
        comment: 'Test comment',
        createdAt: new Date(),
        replyText: ''
      };
      const commentId = 'comment123';

      service.getCommentById(commentId).subscribe(comment => {
        expect(comment).toEqual(mockComment);
      });

      const req = httpMock.expectOne(`${apiUrl}/${commentId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockComment);
    });
  });

  describe('updateCommentById', () => {
    it('should update a comment', () => {
      const mockCommentUpdate: Partial<Comment> = {
        comment: 'Updated comment'
      };
      const commentId = 'comment123';
  
      const mockResponseComment: Comment = {
        _id: commentId,
        user: { _id: '1', username: 'testUser' },
        comment: 'Updated comment',
        createdAt: new Date(),
        replyText: ''
      };
  
      service.updateCommentById(commentId, mockCommentUpdate).subscribe(comment => {
        expect(comment).toEqual(jasmine.objectContaining(mockCommentUpdate));
      });
  
      const req = httpMock.expectOne(`${apiUrl}/${commentId}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(mockCommentUpdate);
      req.flush(mockResponseComment);
    });
  });

  describe('deleteCommentById', () => {
    it('should delete a comment', () => {
      const commentId = 'comment123';
  
      service.deleteCommentById(commentId).subscribe(response => {
        expect(response).toBeFalsy();
      });
  
      const req = httpMock.expectOne(`${apiUrl}/${commentId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});