import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { saveAs } from 'file-saver'; 

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  public baseURL: string = 'http://localhost:8070';

  constructor(private http: HttpClient) {}
  public getAllSessions(): Observable<any> {
    const endPoint = `${this.baseURL}/list-sessions`;
    return this.http.get(endPoint).pipe(map((res) => res));
  }
  public createNewSession(content: string): Observable<any> {
    const endPoint = `${this.baseURL}/create-session`;
    const body = { 'content': content};
    return this.http.post(endPoint,body).pipe(map((res) => res));
  }
  downloadAudio(audioFileName: string): Observable<Blob> {
    const url = `${this.baseURL}/download-audio/${audioFileName}`; // Full URL for the download endpoint

    return this.http.get(url, { responseType: 'blob' }); // Get the file as a Blob
  }

  // Method to save the downloaded audio file
  saveAudioFile(audioFileName: string) {
    this.downloadAudio(audioFileName).subscribe(
      (fileBlob) => {
        // Use FileSaver.js to save the file locally
        saveAs(fileBlob, audioFileName);
      },
      (error) => {
        console.error('Error downloading the file:', error);
      }
    );
  }
  getSessionDetails(sessionId: string): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/get-session/${sessionId}`);
  }
  getBackgroundHtml(): Observable<any> {
    return this.http.get(`${this.baseURL}/visualize-graph`, { responseType: 'text' });
  }
  
}
