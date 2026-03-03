import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { menuItems, adminMenuItems } from '../../constants/sidebar';

@Component({
  selector: 'app-sidebar',
  host: {
    '[class.sidebar-admin]': 'isAdminMode',
    '[class.sidebar-collapsed]': 'menuClosed',
  },
  imports: [RouterModule, CommonModule, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit, OnDestroy {
  /** Collapsed = narrow icon-only strip; expanded = full sidebar with labels. */
  menuClosed = false;
  menuItems = menuItems;
  adminMenuItems = adminMenuItems;
  /** True when current route is /admin (or under). Switches menu and styling only; no impact on idea or other routes. */
  isAdminMode = false;

  /** Emits true when sidebar is collapsed, false when expanded. Parent uses this to adjust main content width. */
  @Output() sidebarToggled = new EventEmitter<boolean>();

  private sub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateAdminMode(this.router.url);
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.updateAdminMode(e.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private updateAdminMode(url: string): void {
    const path = url.split('?')[0];
    this.isAdminMode = path === '/admin' || path.startsWith('/admin/');
  }

  onMenuclick(): void {
    this.menuClosed = !this.menuClosed;
    this.sidebarToggled.emit(this.menuClosed);
  }

  gotoHome(): void {
    if (this.isAdminMode) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
