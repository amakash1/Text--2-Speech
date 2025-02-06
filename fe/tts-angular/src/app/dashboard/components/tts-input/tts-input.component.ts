import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../../http.service';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-tts-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tts-input.component.html',
  styleUrl: './tts-input.component.scss',
})
export class TtsInputComponent implements OnInit {
  @Input() session: any; // Accept session as input
  sessionText: string = ''; // Text input from the user
  audioFile: string | null = null; // This will hold the downloaded audio file URL
  graphHtml: string = '';
  constructor(
    private httpService: HttpService,
    private el: ElementRef,
    private http: HttpClient,
    private renderer: Renderer2
  ) {}
  ngOnInit(): void {
  }
  // Function to handle the "Send" button click
  sendMessage() {
    if (this.sessionText.trim()) {
      this.httpService.createNewSession(this.sessionText).subscribe(
        (response) => {
          if (response && response.success) {
            console.log('Session created:', response);
            alert(response.message); // Show success message
            this.downloadAudio(response.audioFile);
          } else {
            console.log('Session creation failed');
            alert('Session creation failed.');
          }
        },
        (error) => {
          console.error('Error occurred:', error);
          alert('Failed to create session.');
        }
      );

      this.sessionText = ''; // Reset the input after sending the message
    } else {
      alert('Please enter content before sending.');
    }
  }
  downloadAudio(audioFileName: string) {
    this.httpService.downloadAudio(audioFileName).subscribe(
      (fileBlob) => {
        // Convert the Blob into a URL that can be used in the audio player
        this.audioFile = URL.createObjectURL(fileBlob); // Set the audio file URL
      },
      (error) => {
        console.error('Error downloading the audio file:', error);
        alert('Failed to download the audio file.');
      }
    );
  }
  fetchGraphHtml(): void {
    this.http
      .get('http://localhost:8070/visualize-graph', { responseType: 'text' })
      .subscribe({
        next: (response) => {
          this.graphHtml = response;
          this.downloadHtmlFile(response); // Trigger download after receiving HTML content
        },
        error: (err) => {
          console.error('Error fetching graph HTML:', err);
        },
      });
  }

  // Method to download the HTML file
  downloadHtmlFile(htmlContent: string): void {
    const blob = new Blob([htmlContent], { type: 'text/html' }); // Create a Blob with HTML content
    const link = document.createElement('a'); // Create a link element
    const url = URL.createObjectURL(blob); // Create an object URL for the Blob
    link.href = url;
    link.download = 'graph.html'; // Set the file name for download
    link.click(); // Simulate a click to trigger the download
    URL.revokeObjectURL(url); // Clean up the object URL
  }
}
