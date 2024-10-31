import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface LoginResponse {
  tokenData: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users/signin`;
  private apiUrlSignup = `${environment.apiUrl}/users/signup`;

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(this.apiUrl, { username, password })
      .pipe(
        tap((response) => {
          const accessToken = response.tokenData.access_token;
          localStorage.setItem('authToken', accessToken);
          this.router.navigate(['/dashboard']);
        })
      );
  }

  signup(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(this.apiUrlSignup, { username, password })
      .pipe(
        tap((response) => {
          this.router.navigate(['/']);
        })
      );
  }

  logout() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/']);
  }
}
