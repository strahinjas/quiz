import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UserService } from './user.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

	constructor(private userService: UserService) { }

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		if (this.userService.loggedIn() && request.url.startsWith(this.userService.apiURL)) {
			request = request.clone({
				setHeaders: {
					Authorization: this.userService.token
				}
			});
		}

		return next.handle(request);
	}

}