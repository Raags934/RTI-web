import { Component, OnInit, signal, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { RouterOutlet } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { Sidebar } from './shared/components/sidebar/sidebar';
import { Header } from './shared/components/header/header';

import { Subscription } from 'rxjs';
import { IdeaEventsService } from './events/ideaServiceEvents';
import { toast, createIdeaToast } from './shared/constants/toast';
import { Toast } from './shared/components/toast/toast';

import { loadMasterData } from './store/masterData/masterData.actions';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSidenavModule, MatButtonModule, Sidebar, Header, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('src');

  private store = inject(Store);

  createIdeaToast: toast = createIdeaToast;

  private eventsSub!: Subscription;

  constructor(private ideaEvents: IdeaEventsService) {}

  ngOnInit(): void {

    this.store.dispatch(loadMasterData({ email: 'karthik@example.com' }));

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
    }, 9000);
  }
}
