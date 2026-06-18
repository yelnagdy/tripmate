import { Pipe, PipeTransform } from '@angular/core';
import { safeUrl } from './safe-url';

@Pipe({ name: 'safeUrl', standalone: true, pure: true })
export class SafeUrlPipe implements PipeTransform {
  transform(url: string | null | undefined, fallback: string): string {
    return safeUrl(url, fallback);
  }
}
