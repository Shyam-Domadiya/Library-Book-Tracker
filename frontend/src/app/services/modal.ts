import { Injectable, signal } from '@angular/core';

export interface ModalData {
  title: string;
  message: string;
  type?: 'info' | 'error' | 'success';
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  public data = signal<ModalData | null>(null);

  open(title: string, message: string, type: 'info' | 'error' | 'success' = 'info') {
    this.data.set({ title, message, type });
  }

  close() {
    this.data.set(null);
  }
}
