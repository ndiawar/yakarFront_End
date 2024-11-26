import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { AnalyseComponent } from './analyse/analyse.component';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [AnalyseComponent],
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css']
})
export class UserPageComponent implements OnInit {
  user: any;
  currentDateTime: string = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    this.updateDateTime();
  }

  updateDateTime(): void {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short', // Affiche le mois sous forme abrégée (e.g., "Nov")
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };
    this.currentDateTime = new Intl.DateTimeFormat('en-US', options).format(now);
  }
}
