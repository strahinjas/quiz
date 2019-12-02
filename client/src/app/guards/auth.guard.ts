import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { UserService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private userService: UserService,
    private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.userService.loggedIn()) {
      const user = this.userService.loggedUser;

      if (!user || user.role === next.data.role) {
        return true;
      }
      else {
        this.router.navigate(['ranks']);
        return false;
      }
    }
    else {
      this.router.navigate(['login']);
      return false;
    }
  }
  
}
