import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ItemTypeConfig, UniversalItem } from '../../models/universal.models';

@Injectable({ providedIn: 'root' })
export class UniversalNavigationService {

  private readonly router  = inject(Router);
  private readonly configs = new Map<string, ItemTypeConfig>();

  register(config: ItemTypeConfig): void {
    this.configs.set(config.type, config);
  }

  viewItem(item: UniversalItem): void {
    const cfg = this.configs.get(item.type);
    if (!cfg) {
      console.warn(`[UniversalNav] type "${item.type}" not registered — falling back to universal detail`);
      this.router.navigate(['/main/item', item.type, item.id], { state: { item } });
      return;
    }
    const segments = cfg.useIdParam ? [cfg.route, item.id] : [cfg.route];
    this.router.navigate(segments, { state: { item } });
  }

  getConfig(type: string): ItemTypeConfig | undefined {
    return this.configs.get(type);
  }

  isRegistered(type: string): boolean {
    return this.configs.has(type);
  }

  allTypes(): string[] {
    return [...this.configs.keys()];
  }
}
