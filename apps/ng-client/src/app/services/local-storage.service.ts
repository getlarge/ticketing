import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  static get(key: string): string {
    return localStorage.getItem(key) || '';
  }

  static getObject<T = Record<string, unknown>>(key: string): T | null {
    const value = this.get(key);
    return value ? JSON.parse(value) : null;
  }

  static set(key: string, value: string = ''): void {
    localStorage.setItem(key, value);
  }

  static setObject<T = Record<string, unknown>>(key: string, value: T): void {
    this.set(key, JSON.stringify(value));
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  get(key: string): string {
    return LocalStorageService.get(key);
  }

  getObject<T = Record<string, unknown>>(key: string): T | null {
    return LocalStorageService.getObject(key);
  }

  set(key: string, value: string = ''): void {
    LocalStorageService.set(key, value);
  }

  setObject<T = Record<string, unknown>>(key: string, value: T): void {
    LocalStorageService.setObject(key, value);
  }

  remove(key: string): void {
    LocalStorageService.remove(key);
  }
}
