import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

import { User } from '../models';

const jwtHelper = new JwtHelperService();

@Injectable({
  providedIn: 'root'
})
export class UserService {
  apiURL: string = 'http://localhost:5000';

  constructor(private http: HttpClient) { }

  get token()      { return sessionStorage.getItem('access_token'); }
  get loggedUser() { return JSON.parse(sessionStorage.getItem('loggedUser')); }

  set token(token: string)   { sessionStorage.setItem('access_token', token); }
  set loggedUser(user: User) { sessionStorage.setItem('loggedUser', JSON.stringify(user)); }

  // Registration

  sendRequest(formData: FormData) {
    return this.http.post(`${this.apiURL}/users/request`, formData);
  }

  getRequests() {
    return this.http.get(`${this.apiURL}/users/request`);
  }

  register(request: User, accepted: boolean) {
    return this.http.post(`${this.apiURL}/users/register`, { request: request, accepted: accepted });
  }

  // Login

  authenticate(user: User) {
    return this.http.post(`${this.apiURL}/users/authenticate`, user);
  }

  loggedIn(): boolean {
    return !jwtHelper.isTokenExpired(this.token);
  }

  loggedOut(): boolean {
    return !this.loggedIn();
  }

  logout(): void {
    sessionStorage.clear();
  }

  // Password Change

  getSecretQuestion(username: string, jmbg: string) {
    return this.http.post(`${this.apiURL}/users/question`, { username, jmbg });
  }

  checkAnswer(username: string, answer: string) {
    return this.http.post(`${this.apiURL}/users/answer`, { username, answer });
  }

  changePassword(data: any) {
    return this.http.post(`${this.apiURL}/users/password-change`, data);
  }

  // User Data

  getProfile() {
    return this.http.get(`${this.apiURL}/users/profile`);
  }

}
