import { Component, OnInit, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule, Location } from '@angular/common';
import { Buttons } from '../buttons/buttons';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';
import { Subscription } from 'rxjs';
import { headerConfigs, headerTitle } from '../../constants/headerTitle';
import { Popup, cancelIdea} from '../../constants/popUp';

@Component({
  selector: 'app-header-welcome',
  standalone: true,
  imports: [MatIconModule, CommonModule, Buttons],
  templateUrl: './header-welcome.html',
  styleUrls: ['./header-welcome.scss'],
})
export class HeaderWelcome implements OnInit {
  @Input() userName: string = 'Karthik Perisetti';
  pageHeader: headerTitle = headerConfigs.homeHeader;
  currentRoute: string = '';
  prevNextBtnsVisible: boolean = false;

  constructor(
    private router: Router,
    private location: Location,
    private ideaEvents: IdeaEventsService
  ) {}

  private sub!: Subscription;
  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        this.updatePageTitle();
      });

    // Set initial title on first load
    this.updatePageTitle();
  }


  updatePageTitle(): void {
    const path = this.currentRoute.replace(/^\/+/, '').split('/')[0];
    const fullPath = this.currentRoute.split('?')[0].replace(/^\/+/, '');
    this.prevNextBtnsVisible = false
    if (fullPath.includes('admin/users')) {
      this.pageHeader = headerConfigs.adminManageUsersHeader;
      return;
    }
    switch (path) {
      case headerConfigs.addIdeaHeader.expected:
        this.pageHeader = headerConfigs.addIdeaHeader;
        break;
   
      case headerConfigs.myIdeasHeader.expected:
        this.pageHeader = headerConfigs.myIdeasHeader;
        break;
   
      case headerConfigs.contactForHelpHeader.expected:
        this.pageHeader = headerConfigs.contactForHelpHeader;
        break;

      case headerConfigs.adminHomeHeader.expected:
        this.pageHeader = headerConfigs.adminHomeHeader;
        break;

      case headerConfigs.viewIdeaHeader.expected:
        this.prevNextBtnsVisible = true
        this.pageHeader = headerConfigs.viewIdeaHeader;
        break;
   
      default:
        this.pageHeader = headerConfigs.homeHeader;
        break;
    }

  }

  goBack(): void {
    this.location.back();
  }
}
