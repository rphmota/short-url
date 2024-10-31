import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UrlService } from '../services/url.service';

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  url: string = '';
  urlEncurtada: string | null = null;

  constructor(private urlService: UrlService) {}

  encurtarUrl() {
    this.urlService.encurtarUrl(this.url).subscribe({
      next: (response) => {
        this.urlEncurtada = response.short_url;
      },
      error: (error) => {
        console.error('Erro ao encurtar a URL:', error);
      },
    });
  }
}
