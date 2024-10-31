import { Component, OnInit } from '@angular/core';
import { UrlService } from '../services/url.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

interface Url {
  id: string;
  original_url: string;
  short_code: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  click_count: number;
}

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule],
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  urls: Url[] = [];
  url: string = '';
  urlEncurtada: string | null = null;
  editingUrlId: string | null = null;
  editingOriginalUrl: string = '';

  constructor(private urlService: UrlService) {}

  ngOnInit(): void {
    this.loadUrls();
  }

  loadUrls() {
    this.urlService.getUrls().subscribe({
      next: (data) => {
        this.urls = data;
      },
      error: (error) => {
        console.error('Erro ao carregar URLs:', error);
      },
    });
  }

  encurtarUrl() {
    this.urlService.encurtarUrlComToken(this.url).subscribe({
      next: (response) => {
        this.urlEncurtada = response.short_url;
        this.loadUrls();
      },
      error: (error) => {
        console.error('Erro ao encurtar a URL:', error);
      },
    });
  }

  deleteUrl(id: string) {
    this.urlService.deleteUrl(id).subscribe({
      next: () => {
        this.urls = this.urls.filter((url) => url.id !== id);
      },
      error: (error) => {
        console.error('Erro ao deletar URL:', error);
      },
    });
  }

  requestEditUrl(id: string, currentUrl: string) {
    this.editingUrlId = id;
    this.editingOriginalUrl = currentUrl;
  }

  saveEdit(id: string) {
    this.editUrl(id, this.editingOriginalUrl);
    this.editingUrlId = null;
  }

  editUrl(id: string, newUrl: string) {
    this.urlService.editUrl(id, newUrl).subscribe({
      next: () => {
        this.loadUrls();
        this.editingUrlId = null;
      },
      error: (error) => {
        console.error('Erro ao editar URL:', error);
      },
    });
  }

  generateFullUrl(shortCode: string): string {
    return `${environment.apiUrl}/urls/${shortCode}`;
  }

  handleLinkClick(url: Url): void {
    setTimeout(() => {
      this.loadUrls();
    }, 500);
  }
}
