import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CurrentUserInterface } from "../types/currentUser.interface";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable()
export class AuthService {
    constructor(private http: HttpClient) {}

    getCurrentUser(): Observable<CurrentUserInterface> {
        const url = environment.apiUrl + '/user';
        return this.http.get<CurrentUserInterface>(url);
    }
}