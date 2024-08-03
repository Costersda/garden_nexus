import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ForumService } from '../forum.service';
import { Forum } from '../../types/forum.interface';
import { environment } from '../../../../environments/environment';

describe('ForumService', () => {
  let service: ForumService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/forums`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ForumService]
    });
    service = TestBed.inject(ForumService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllForums', () => {
    it('should return an Observable<Forum[]>', () => {
      const dummyForums: Forum[] = [
        { _id: '1', user_id: 'user1', title: 'Forum 1', content: 'Content 1', categories: ['cat1'], comments: [], createdAt: new Date(), updatedAt: new Date() },
        { _id: '2', user_id: 'user2', title: 'Forum 2', content: 'Content 2', categories: ['cat2'], comments: [], createdAt: new Date(), updatedAt: new Date() }
      ];

      service.getAllForums().subscribe(forums => {
        expect(forums.length).toBe(2);
        expect(forums).toEqual(dummyForums);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(dummyForums);
    });
  });

  describe('getForumById', () => {
    it('should return an Observable<Forum>', () => {
      const dummyForum: Forum = { _id: '1', user_id: 'user1', title: 'Forum 1', content: 'Content 1', categories: ['cat1'], comments: [], createdAt: new Date(), updatedAt: new Date() };

      service.getForumById('1').subscribe(forum => {
        expect(forum).toEqual(dummyForum);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyForum);
    });
  });

  describe('createForum', () => {
    it('should return an Observable<Forum>', () => {
      const newForum: Forum = { user_id: 'user1', title: 'New Forum', content: 'New Content', categories: ['cat1'], comments: [], createdAt: new Date(), updatedAt: new Date() };

      service.createForum(newForum).subscribe(forum => {
        expect(forum).toEqual(newForum);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newForum);
      req.flush(newForum);
    });
  });

  describe('updateForum', () => {
    it('should return an Observable<Forum>', () => {
      const updatedForum: Forum = { _id: '1', user_id: 'user1', title: 'Updated Forum', content: 'Updated Content', categories: ['cat1', 'cat2'], comments: [], createdAt: new Date(), updatedAt: new Date() };

      service.updateForum('1', updatedForum).subscribe(forum => {
        expect(forum).toEqual(updatedForum);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updatedForum);
      req.flush(updatedForum);
    });
  });

  describe('deleteForum', () => {
    it('should send a DELETE request', () => {
      service.deleteForum('1').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('getForumsBySearch', () => {
    it('should return an Observable<Forum[]> with query params', () => {
      const dummyForums: Forum[] = [
        { _id: '1', user_id: 'user1', title: 'Forum 1', content: 'Content 1', categories: ['cat1'], comments: [], createdAt: new Date(), updatedAt: new Date() },
        { _id: '2', user_id: 'user2', title: 'Forum 2', content: 'Content 2', categories: ['cat2'], comments: [], createdAt: new Date(), updatedAt: new Date() }
      ];

      service.getForumsBySearch('test', ['cat1', 'cat2']).subscribe(forums => {
        expect(forums).toEqual(dummyForums);
      });

      const req = httpMock.expectOne(`${apiUrl}/search?query=test&categories=cat1,cat2`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyForums);
    });
  });

  describe('getForumsByUser', () => {
    it('should return an Observable<Forum[]>', () => {
      const dummyForums: Forum[] = [
        { _id: '1', user_id: 'user1', title: 'Forum 1', content: 'Content 1', categories: ['cat1'], comments: [], createdAt: new Date(), updatedAt: new Date() },
        { _id: '2', user_id: 'user1', title: 'Forum 2', content: 'Content 2', categories: ['cat2'], comments: [], createdAt: new Date(), updatedAt: new Date() }
      ];

      service.getForumsByUser('user1').subscribe(forums => {
        expect(forums).toEqual(dummyForums);
      });

      const req = httpMock.expectOne(`${apiUrl}/user/user1`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyForums);
    });
  });
});