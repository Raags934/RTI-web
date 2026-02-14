import { Component, OnInit, signal, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { Sidebar } from './shared/components/sidebar/sidebar';
import { Header } from './shared/components/header/header';

import { Subscription } from 'rxjs';
import { IdeaEventsService } from './events/ideaServiceEvents';
import { toast, createIdeaToast } from './shared/constants/toast';
import { Toast } from './shared/components/toast/toast';

import { loadMasterData } from './store/masterData/masterData.actions';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSidenavModule, MatButtonModule, Sidebar, Header, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('src');

  private store = inject(Store);
  private authService = inject(AuthService);
  private router = inject(Router);

  /** Show main layout (sidebar + header) only when on a protected route (not login/callback/access-denied). */
  showShell = false;

  createIdeaToast: toast = createIdeaToast;

  private eventsSub!: Subscription;
  private authSub!: Subscription;

  constructor(private ideaEvents: IdeaEventsService) {}

  ngOnInit(): void {
    const publicPaths = ['/login', '/callback', '/access-denied'];
    const checkShell = () => {
      const url = this.router.url.split('?')[0];
      this.showShell = !publicPaths.some((p) => url === p || url.startsWith(p + '?'));
    };
    checkShell();
    this.router.events.subscribe(() => checkShell());

    this.authSub = this.authService.currentUserAsObservable
      .pipe(filter((user) => !!user?.email))
      .subscribe((user) => {
        if (user?.email) {
          this.store.dispatch(loadMasterData({ email: user.email }));
        }
      });

    this.eventsSub = this.ideaEvents.events$.subscribe((event) => {
      if (event.type === 'toastEvent') {
        this.showToast(event.payload);
      }
    });
  }

  showToast(message: string) {
    console.log('app toast');
    this.createIdeaToast.message = message;
    this.createIdeaToast.visible = true;
    setTimeout(() => {
      this.createIdeaToast.visible = false;
    }, 7000);
  }
}