import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Forum } from '../types/forum.interface';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private apiUrl = `${environment.apiUrl}/forums`;

  constructor(private http: HttpClient) { }

  getAllForums(): Observable<Forum[]> {
    return this.http.get<Forum[]>(this.apiUrl);
  }

  getForumById(id: string): Observable<Forum> {
    return this.http.get<Forum>(`${this.apiUrl}/${id}`);
  }

  createForum(forum: Forum): Observable<Forum> {
    return this.http.post<Forum>(this.apiUrl, forum);
  }

  updateForum(id: string, forum: Forum): Observable<Forum> {
    return this.http.patch<Forum>(`${this.apiUrl}/${id}`, forum);
  }

  deleteForum(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getForumsBySearch(query: string, categories: string[]): Observable<Forum[]> {
    let params = new HttpParams();
    if (query) {
      params = params.set('query', query);
    }
    if (categories.length) {
      params = params.set('categories', categories.join(','));
    }

    return this.http.get<Forum[]>(`${this.apiUrl}/search`, { params });
  }

  getForumsByUser(username: string): Observable<Forum[]> {
    return this.http.get<Forum[]>(`${this.apiUrl}/user/${username}`);
  }
}
