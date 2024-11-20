import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Importation de CommonModule

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],  // Ajouter CommonModule dans les imports
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  
  public today: number = Date.now();

  constructor() { }

  ngOnInit(): void {
  }

}
