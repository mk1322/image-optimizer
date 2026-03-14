import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface ImageItem {
  file: File;
  originalDataURL: string;
  compressedDataURL: string;
  originalSize: string;
  compressedSize: string;
  saving: number;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  images: ImageItem[] = [];
  quality: number = 80;
  isDragOver: boolean = false;

  get isReady(): boolean {
    return this.images.length > 0;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave() {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files) this.handleFiles(files);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) this.handleFiles(input.files);
  }

  handleFiles(files: FileList) {
    Array.from(files).forEach(file => {
      if (!file.type.match('image/jpeg') && !file.type.match('image/png')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const item: ImageItem = {
          file,
          originalDataURL: e.target?.result as string,
          compressedDataURL: '',
          originalSize: this.formatSize(file.size),
          compressedSize: '',
          saving: 0
        };
        this.images.push(item);
        this.compressItem(item);
      };
      reader.readAsDataURL(file);
    });
  }

  onQualityChange() {
    this.images.forEach(item => this.compressItem(item));
  }

  compressItem(item: ImageItem) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const quality = this.quality / 100;
      item.compressedDataURL = canvas.toDataURL(item.file.type, quality);

      const base64 = item.compressedDataURL.split(',')[1];
      const compressedBytes = Math.round((base64.length * 3) / 4);
      item.compressedSize = this.formatSize(compressedBytes);
      item.saving = Math.round((1 - compressedBytes / item.file.size) * 100);
    };
    img.src = item.originalDataURL;
  }

  download(item: ImageItem) {
    const a = document.createElement('a');
    a.href = item.compressedDataURL;
    a.download = 'compressed_' + item.file.name;
    a.click();
  }

  downloadAll() {
    this.images.forEach(item => this.download(item));
  }

  clearAll() {
    this.images = [];
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}
