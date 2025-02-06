import { Component, Input, SimpleChanges } from '@angular/core';
import { HttpService } from '../../../http.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tts-plain',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tts-plain.component.html',
  styleUrl: './tts-plain.component.scss'
})
export class TtsPlainComponent {
  @Input() sessionId: string | null = null;
  sessionDetails: any = null;
  isLoading = false;
  audioFileUrl: string | null = null;
  constructor(private httpService: HttpService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sessionId'] && changes['sessionId'].currentValue) {
      this.fetchSessionDetails(changes['sessionId'].currentValue);
    }
  }

  fetchSessionDetails(sessionId: string) {
    this.isLoading = true;
    this.httpService.getSessionDetails(sessionId).subscribe(
      (response) => {
        this.sessionDetails = response;
        if (response.data[0].audioFile) {
          this.downloadAudio(response.data[0].audioFile);
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching session details:', error);
        this.isLoading = false;
        alert('Failed to fetch session details.');
      }
    );
  }

  downloadAudio(audioFileName: string) {
    this.httpService.downloadAudio(audioFileName).subscribe(
      (blob) => {
        const url = URL.createObjectURL(blob);
        this.audioFileUrl = url; // Create a URL for the audio file
      },
      (error) => {
        console.error('Error downloading audio file:', error);
        alert('Failed to download audio file.');
      }
    );
  }
}
