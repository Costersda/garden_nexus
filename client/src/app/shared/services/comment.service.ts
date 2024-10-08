import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../types/comment.interface';
import { environment } from '../../../environments/environment.prod';

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
    const updatePayload = {
      comment: comment.comment,
      isEdited: comment.isEdited,
      user: comment.user && comment.user._id ? { _id: comment.user._id } : undefined,
      replyingTo: comment.replyingTo
    };

    return this.http.patch<Comment>(`${this.apiUrl}/${id}`, updatePayload);
  }

  deleteCommentById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

