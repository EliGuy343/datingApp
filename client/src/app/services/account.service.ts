import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentUserSource = new ReplaySubject<User|null>(1);
  currentUser$ = this.currentUserSource.asObservable(); 

  constructor(private http:HttpClient) { }

  login(model: any) {
    return this.http.post<User>(this.baseUrl +'account/login-user', model).pipe(
      map((response:User) =>{
        //Reminder: If this is not used, just use response
        const user = response;
        if(user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSource.next(user);
        }
      })
    );
  }

  register(model:any) {
    return this.http.post<User>(this.baseUrl+`account/register`, model).pipe(
      map((response:User) =>{
        const user = response;
        if(user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSource.next(user);
        }
      })
    )
  }

  setCurrentUser(user: User) {
    debugger;
    user.roles = [];
    const roles = this.getDecodedToken(user.token).role;
    debugger;
    Array.isArray(roles) ? user.roles = roles : user.roles.push(roles);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
  }

  getDecodedToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
  }
}
