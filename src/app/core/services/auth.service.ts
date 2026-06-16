import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private _httpClient: HttpClient) { }
   RegisterUser(userdata:object):Observable<any>{
    return this._httpClient.post('/api/auth/register',userdata )

}
loginuser(userdata:object):Observable<any>{
  return this._httpClient.post('/api/auth/login',userdata )
}
}
