import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  originalFile: File | null = null;
  originalDataURL: string = '';
  compressedDataURL: string = '';
  originalSize: string = '';
  compressedSize: string = '';
  savingInfo: string = '';
  quality: number = 80;
  isDragOver: boolean = false;
  isReady: boolean = false;
  mimeType: string = 'image/jpeg';

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
    const file = event.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleFile(file);
  }

  handleFile(file: File) {
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      alert('Proszę wybrać plik JPG, JPEG lub PNG.');
      return;
    }

    this.originalFile = file;
    this.mimeType = file.type;
    this.originalSize = this.formatSize(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      this.originalDataURL = e.target?.result as string;
      this.isReady = true;
      this.compress();
    };
    reader.readAsDataURL(file);
  }

  onQualityChange() {
    if (this.originalDataURL) this.compress();
  }

  compress() {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const quality = this.quality / 100;
      this.compressedDataURL = canvas.toDataURL(this.mimeType, quality);

      const base64 = this.compressedDataURL.split(',')[1];
      const compressedBytes = Math.round((base64.length * 3) / 4);
      this.compressedSize = this.formatSize(compressedBytes);

      const saved = Math.round((1 - compressedBytes / this.originalFile!.size) * 100);
      this.savingInfo = saved > 0
        ? `Oszczędność: ${saved}% mniej miejsca`
        : 'Spróbuj obniżyć jakość aby zmniejszyć rozmiar';
    };
    img.src = this.originalDataURL;
  }

  download() {
    const a = document.createElement('a');
    a.href = this.compressedDataURL;
    a.download = 'compressed_' + (this.originalFile?.name || 'image.jpg');
    a.click();
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}
