import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../types/comment.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) {}

  createComment(comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, comment);
  }

  getCommentsByBlogId(blogId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/blog/${blogId}`);
  }

  getCommentsByForumId(forumId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/forum/${forumId}`);
  }

  getCommentById(id: string): Observable<Comment> {
    return this.http.get<Comment>(`${this.apiUrl}/${id}`);
  }

  updateCommentById(id: string, comment: Partial<Comment>): Observable<Comment> {
    return this.http.patch<Comment>(`${this.apiUrl}/${id}`, comment);
  }

  deleteCommentById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

