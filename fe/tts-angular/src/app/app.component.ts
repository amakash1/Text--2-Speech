import { Component } from '@angular/core';
import { SidenavWrapperComponent } from './dashboard/components/sidenav-wrapper/sidenav-wrapper.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone:true,
  imports: [SidenavWrapperComponent],
})
export class AppComponent {
  title = 'expandable-sidenav';
}
