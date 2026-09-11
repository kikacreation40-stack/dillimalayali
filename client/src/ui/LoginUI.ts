import { DISTRICTS } from '../../../shared/constants';
import type { Profile } from '../../../shared/types';

export class LoginUI {
  profile: Profile = { name: '', hometown: '', avatar: 'male', showName: true, showHometown: true, allowTalk: true };
  constructor() {
    try {
      const saved = JSON.parse(localStorage.getItem('dmw.profile') || 'null');
      if (saved && typeof saved.name === 'string') this.profile = { ...this.profile, name: saved.name.slice(0, 24), avatar: saved.avatar === 'female' ? 'female' : 'male', hometown: DISTRICTS.includes(saved.hometown) ? saved.hometown : '', showName: saved.showName !== false, showHometown: saved.showHometown !== false, allowTalk: saved.allowTalk !== false };
      if (!localStorage.getItem('dmw.guest')) localStorage.setItem('dmw.guest', crypto.randomUUID());
    } catch { /* Storage may be unavailable in private browsing; session still works. */ }
    const selector = document.querySelector<HTMLSelectElement>('#hometown')!;
    for (const district of DISTRICTS) selector.add(new Option(district, district));
    document.querySelector<HTMLInputElement>('#display-name')!.value = this.profile.name;
    selector.value = this.profile.hometown;
    document.querySelector<HTMLSelectElement>('#avatar')!.value = this.profile.avatar;
    document.querySelector<HTMLSelectElement>('#settings-avatar')!.value = this.profile.avatar;
    for (const key of ['showName', 'showHometown', 'allowTalk'] as const) document.querySelector<HTMLInputElement>(`#${key}`)!.checked = this.profile[key];
  }
  read(): Profile {
    this.profile.avatar = document.querySelector<HTMLSelectElement>('#avatar')!.value === 'female' ? 'female' : 'male';
    document.querySelector<HTMLSelectElement>('#settings-avatar')!.value = this.profile.avatar;
    this.profile.name = document.querySelector<HTMLInputElement>('#display-name')!.value.trim();
    this.profile.hometown = document.querySelector<HTMLSelectElement>('#hometown')!.value;
    if (!this.profile.hometown) this.profile.showHometown = false;
    document.querySelector<HTMLInputElement>('#showHometown')!.checked = this.profile.showHometown;
    this.save(); return this.profile;
  }
  save(): void { try { localStorage.setItem('dmw.profile', JSON.stringify(this.profile)); } catch { /* Optional storage. */ } }
}
