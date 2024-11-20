import { Component } from '@angular/core';
import { AnalyseComponent } from './analyse/analyse.component';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [AnalyseComponent],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css'
})
export class AdminPageComponent {

}
