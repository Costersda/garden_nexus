import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BlogService } from '../blog.service';
import { environment } from '../../../../environments/environment';
import { Blog } from '../../types/blog.interface';

describe('BlogService', () => {
  let service: BlogService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/blogs`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BlogService]
    });

    service = TestBed.inject(BlogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all blogs', () => {
    const dummyBlogs: Blog[] = [
      {
        _id: '1',
        user_id: 'user1',
        title: 'Blog 1',
        content_section_1: 'Content 1',
        image_1: 'image1.jpg',
        categories: ['category1'],
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
        categories: ['category2'],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    service.getAllBlogs().subscribe(blogs => {
      expect(blogs.length).toBe(2);
      expect(blogs).toEqual(dummyBlogs);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(dummyBlogs);
  });

  it('should get blog by id', () => {
    const dummyBlog: Blog = {
      _id: '1',
      user_id: 'user1',
      title: 'Blog 1',
      content_section_1: 'Content 1',
      image_1: 'image1.jpg',
      categories: ['category1'],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    service.getBlogById('1').subscribe(blog => {
      expect(blog).toEqual(dummyBlog);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyBlog);
  });

  it('should create a blog', () => {
    const newBlog: Blog = {
      user_id: 'user3',
      title: 'New Blog',
      content_section_1: 'New Content',
      image_1: 'newimage.jpg',
      categories: ['newcategory'],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const createdBlog: Blog = { _id: '3', ...newBlog };

    service.createBlog(newBlog).subscribe(blog => {
      expect(blog).toEqual(createdBlog);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newBlog);
    req.flush(createdBlog);
  });

  it('should update a blog', () => {
    const updatedBlog: Blog = {
      _id: '1',
      user_id: 'user1',
      title: 'Updated Blog',
      content_section_1: 'Updated Content',
      image_1: 'updatedimage.jpg',
      categories: ['updatedcategory'],
      comments: [],
      isEdited: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    service.updateBlog('1', updatedBlog).subscribe(blog => {
      expect(blog).toEqual(updatedBlog);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(updatedBlog);
    req.flush(updatedBlog);
  });

  it('should delete a blog', () => {
    service.deleteBlog('1').subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should get blogs by search', () => {
    const dummyBlogs: Blog[] = [
      {
        _id: '1',
        user_id: 'user1',
        title: 'Blog 1',
        content_section_1: 'Content 1',
        image_1: 'image1.jpg',
        categories: ['category1'],
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
        categories: ['category2'],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    const query = 'test';
    const categories = ['category1', 'category2'];

    service.getBlogsBySearch(query, categories).subscribe(blogs => {
      expect(blogs).toEqual(dummyBlogs);
    });

    const req = httpMock.expectOne(`${apiUrl}/search?query=test&categories=category1,category2`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyBlogs);
  });

  it('should get blogs by user', () => {
    const dummyBlogs: Blog[] = [
      {
        _id: '1',
        user_id: 'user1',
        title: 'Blog 1',
        content_section_1: 'Content 1',
        image_1: 'image1.jpg',
        categories: ['category1'],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '2',
        user_id: 'user1',
        title: 'Blog 2',
        content_section_1: 'Content 2',
        image_1: 'image2.jpg',
        categories: ['category2'],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    const username = 'user1';

    service.getBlogsByUser(username).subscribe(blogs => {
      expect(blogs).toEqual(dummyBlogs);
    });

    const req = httpMock.expectOne(`${apiUrl}/user/${username}`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyBlogs);
  });
});