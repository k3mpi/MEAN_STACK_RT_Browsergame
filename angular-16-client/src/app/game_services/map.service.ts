import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/tilemap/create/';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  constructor(private http: HttpClient) {}



  getCreateMap(): Observable<any> {
    return this.http.get(API_URL, { responseType: 'json' });
  }

}
