import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Retrieve token from local storage
    const token = localStorage.getItem('token');

    // Clone the request and add the Authorization header
    req = req.clone({
      setHeaders: {
        Authorization: token ?? '',
      },
    });

    // Pass the modified request to the next handler
    return next.handle(req);
  }
}