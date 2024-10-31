import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface ShortenUrlResponse {
  short_url: string;
}

interface Url {
  id: string;
  original_url: string;
  short_code: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  click_count: number;
}

@Injectable({
  providedIn: 'root',
})
export class UrlService {
  private apiUrl = environment.apiUrl + '/urls';

  constructor(private http: HttpClient) {}

  encurtarUrl(originalUrl: string): Observable<ShortenUrlResponse> {
    const body = { original_url: originalUrl };
    return this.http.post<ShortenUrlResponse>(this.apiUrl, body);
  }

  encurtarUrlComToken(originalUrl: string): Observable<ShortenUrlResponse> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    const body = { original_url: originalUrl };
    return this.http.post<ShortenUrlResponse>(this.apiUrl, body, { headers });
  }

  getUrls(): Observable<Url[]> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Url[]>(this.apiUrl, { headers });
  }

  deleteUrl(id: string): Observable<void> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  editUrl(id: string, newUrl: string): Observable<Url> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { original_url: newUrl };
    return this.http.put<Url>(`${this.apiUrl}/${id}`, body, { headers });
  }
}
