import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

type View = 'profile' | 'add-post' | 'my-posts';

interface ProfileDraft {
  name: string;
  email: string;
  location: string;
  country: string;
  currency: string;
  language: string;
  avatar: string;
}

@Component({
  selector: 'app-my-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss',
})
export class MyProfileComponent {

  /* ── View state ─────────────────────────────────────────── */
  readonly activeView = signal<View>('profile');
  setView(v: View): void { this.activeView.set(v); }

  /* ── User profile ───────────────────────────────────────── */
  readonly profile = signal({
    name: 'Dahb',
    email: 'Dhob@gmail.com',
    location: 'Egypt',
    joinDate: '13th February',
    avatar: 'assets/images/profile-avatar.jpeg',
  });

  readonly preferences = signal({
    country: 'Egypt',
    currency: 'EGP',
    language: 'English',
  });

  /* ── Edit mode ──────────────────────────────────────────── */
  readonly isEditing = signal(false);

  readonly draft = signal<ProfileDraft>({
    name: '', email: '', location: '',
    country: '', currency: '', language: '', avatar: '',
  });

  enterEdit(): void {
    const p = this.profile();
    const pref = this.preferences();
    this.draft.set({
      name:     p.name,
      email:    p.email,
      location: p.location,
      avatar:   p.avatar,
      country:  pref.country,
      currency: pref.currency,
      language: pref.language,
    });
    this.isEditing.set(true);
  }

  saveProfile(): void {
    const d = this.draft();
    this.profile.update(p => ({
      ...p,
      name:     d.name.trim()     || p.name,
      email:    d.email.trim()    || p.email,
      location: d.location.trim() || p.location,
      avatar:   d.avatar,
    }));
    this.preferences.update(pref => ({
      ...pref,
      country:  d.country.trim()  || pref.country,
      currency: d.currency.trim() || pref.currency,
      language: d.language.trim() || pref.language,
    }));
    this.isEditing.set(false);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.draft.update(d => ({ ...d, avatar: reader.result as string }));
    reader.readAsDataURL(file);
  }

  setDraft<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]): void {
    this.draft.update(d => ({ ...d, [key]: value }));
  }

  /* ── Add Post form ──────────────────────────────────────── */
  readonly postTitle     = signal('');
  readonly postLocation  = signal('');
  readonly postStory     = signal('');
  readonly previewUrl    = signal<string | null>(null);
  readonly selectedRating  = signal(3);
  readonly hoveredRating   = signal(0);

  readonly stars: number[] = [1, 2, 3, 4, 5];

  readonly activeRating = computed(() => this.hoveredRating() || this.selectedRating());

  setRating(star: number): void  { this.selectedRating.set(star); }
  hoverStar(star: number): void  { this.hoveredRating.set(star); }
  clearHover(): void             { this.hoveredRating.set(0); }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onSubmitPost(): void {
    console.log('Post submitted:', {
      title: this.postTitle(),
      location: this.postLocation(),
      story: this.postStory(),
      rating: this.selectedRating(),
    });
    this.postTitle.set('');
    this.postLocation.set('');
    this.postStory.set('');
    this.previewUrl.set(null);
    this.selectedRating.set(0);
  }
}
