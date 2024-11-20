import { Component } from '@angular/core';
import { AnalyseComponent } from './analyse/analyse.component';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [AnalyseComponent],
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css']
})
export class UserPageComponent {}
