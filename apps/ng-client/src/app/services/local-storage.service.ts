import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  get(key: string): string {
    return localStorage.getItem(key) || '';
  }

  getObject<T = Record<string, unknown>>(key: string): T | null {
    const value = this.get(key);
    return value ? JSON.parse(value) : null;
  }

  set(key: string, value: string = ''): void {
    localStorage.setItem(key, value);
  }

  setObject<T = Record<string, unknown>>(key: string, value: T): void {
    this.set(key, JSON.stringify(value));
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}
