import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../http.service';
import { IAllSessions } from '../../../model/data.model';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TtsInputComponent } from "../tts-input/tts-input.component";
import { TtsPlainComponent } from "../tts-plain/tts-plain.component";



@Component({
  selector: 'app-sidenav-wrapper',
  templateUrl: './sidenav-wrapper.component.html',
  styleUrls: ['./sidenav-wrapper.component.scss'],
  imports: [MatListModule, MatIconModule, MatSidenavModule, CommonModule, MatToolbarModule, TtsInputComponent, TtsPlainComponent],
  standalone:true
})
export class SidenavWrapperComponent implements OnInit {
  isExpanded: boolean = false;
  allSessions: IAllSessions = {
    "sessions": [
       
    ],
    "success": true
};
selectedSessionId: string | null = null;

  constructor(private httpService: HttpService) {}
  ngOnInit(): void {
    this.httpService.getAllSessions().subscribe({
      next: (val) => {
        this.allSessions = val;
      },
    });
  }
  createNewSession() {
    console.log('Create New Session clicked');
    this.selectedSessionId=null
    // Implement your logic for creating a session
  }

  // Handler for selecting a session
 
  selectSession(sessionId: string) {
    this.selectedSessionId = sessionId; // Set the selected session ID
  }
  
}
