// services/blog.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Blog } from '../types/blog.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = `${environment.apiUrl}/blogs`;

  constructor(private http: HttpClient) {}

  getAllBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(this.apiUrl);
  }

  getBlogById(id: string): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/${id}`);
  }

  createBlog(blog: Blog): Observable<Blog> {
    return this.http.post<Blog>(this.apiUrl, blog);
  }

  updateBlog(id: string, blog: Blog): Observable<Blog> {
    return this.http.patch<Blog>(`${this.apiUrl}/${id}`, blog);
  }

  deleteBlog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getBlogsBySearch(query: string, categories: string[]): Observable<Blog[]> {
    let params = new HttpParams();
    if (query) {
      params = params.set('query', query);
    }
    if (categories.length) {
      params = params.set('categories', categories.join(','));
    }

    return this.http.get<Blog[]>(this.apiUrl, { params });
  }
}
