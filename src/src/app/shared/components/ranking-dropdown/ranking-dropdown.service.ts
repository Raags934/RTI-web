import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RankingDropdownService {
  private openDropdownId = new Subject<string | null>();
  public openDropdownId$ = this.openDropdownId.asObservable();
  private currentOpenId: string | null = null;

  openDropdown(id: string) {
    if (this.currentOpenId !== id) {
      this.currentOpenId = id;
      this.openDropdownId.next(id);
    }
  }

  closeAll() {
    this.currentOpenId = null;
    this.openDropdownId.next(null);
  }

  isOpen(id: string): boolean {
    return this.currentOpenId === id;
  }
}
