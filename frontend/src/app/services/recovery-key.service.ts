import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RecoveryKeyService {
  private key = '';

  set(key: string): void { this.key = key; }
  get(): string { return this.key; }
  clear(): void { this.key = ''; }
  has(): boolean { return this.key.length > 0; }
}
