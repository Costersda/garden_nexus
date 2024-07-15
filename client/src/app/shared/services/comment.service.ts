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
    return this.http.get<Comment[]>(`${this.apiUrl}/${blogId}`);
  }

  getCommentsByForumId(forumId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${forumId}`);
  }

  getCommentById(blogId: string, id: string): Observable<Comment> {
    return this.http.get<Comment>(`${this.apiUrl}/${blogId}/${id}`);
  }

  updateCommentById(blogId: string, id: string, comment: Partial<Comment>): Observable<Comment> {
    return this.http.patch<Comment>(`${this.apiUrl}/${blogId}/${id}`, comment);
  }

  deleteCommentById(blogId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${blogId}/${id}`);
  }
}
