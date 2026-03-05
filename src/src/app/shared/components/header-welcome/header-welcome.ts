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
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header-welcome',
  standalone: true,
  imports: [MatIconModule, CommonModule, Buttons],
  templateUrl: './header-welcome.html',
  styleUrls: ['./header-welcome.scss'],
})
export class HeaderWelcome implements OnInit {
  /** Display name in "Welcome back, X". Defaults to user name from AuthService; can be overridden via input if needed. */
  @Input() userName: string = '';
  pageHeader: headerTitle = headerConfigs.homeHeader;
  currentRoute: string = '';
  prevNextBtnsVisible: boolean = false;
  /** Controls visibility of "Welcome back, {{ userName }}" text. */
  showWelcomeLine: boolean = true;

  constructor(
    private router: Router,
    private location: Location,
    private ideaEvents: IdeaEventsService,
    private authService: AuthService
  ) {}

  private sub!: Subscription;
  ngOnInit(): void {
    // Initialize welcome name from current user, if available.
    const user = this.authService.currentUser;
    if (user) {
      this.userName =
        user.name && user.name.trim().length > 0
          ? user.name
          : (user.email ? user.email.split('@')[0] : this.userName);
    }

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
    this.prevNextBtnsVisible = false;

    // Show "Welcome back, {{ userName }}" on the main home/dashboard route
    // and all primary role landing pages.
    // Detail pages (add idea, my ideas, admin detail screens, etc.) should NOT show this line.
    const isHomeOrLandingRoute =
      path === '' ||
      path === 'home' ||
      path === 'harmonizer' ||
      path === 'productprioritization' ||
      path === 'taprioritization' ||
      path === 'funding';
    this.showWelcomeLine = isHomeOrLandingRoute;

    if (fullPath.includes('ideas') && fullPath.includes('edit-draft')) {
      this.pageHeader = headerConfigs.editDraftHeader;
      return;
    }
    if (fullPath.includes('admin/users')) {
      this.pageHeader = headerConfigs.adminManageUsersHeader;
      return;
    }
    if (fullPath.includes('admin/edit-product-list')) {
      this.pageHeader = headerConfigs.adminEditProductListHeader;
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

      case headerConfigs.viewIdeaHeader.expected: {
        this.prevNextBtnsVisible = true;
        // Dynamically replace hard-coded "CL001" in breadcrumb with current idea UID.
        const ideaUid = this.getCurrentIdeaUid();
        const baseConfig = headerConfigs.viewIdeaHeader;
        let breadcrumbParts = [...baseConfig.breadcrumbParts];
        if (ideaUid) {
          const staticIndex = breadcrumbParts.indexOf('CL001');
          if (staticIndex !== -1) {
            breadcrumbParts[staticIndex] = ideaUid;
          } else if (breadcrumbParts.length >= 1) {
            // Insert UID before the last breadcrumb item (usually "View Idea Details").
            breadcrumbParts = [
              ...breadcrumbParts.slice(0, breadcrumbParts.length - 1),
              ideaUid,
              breadcrumbParts[breadcrumbParts.length - 1],
            ];
          }
        }
        this.pageHeader = {
          ...baseConfig,
          breadcrumbParts,
        };
        break;
      }

      default:
        this.pageHeader = headerConfigs.homeHeader;
        break;
    }
  }

  goBack(): void {
    this.location.back();
  }

  /** Walk the current router state tree to find idea_uid route param (for /ideas/:idea_uid[/...]). */
  private getCurrentIdeaUid(): string | null {
    let route: any = this.router.routerState.snapshot.root;
    while (route) {
      if (route.paramMap && route.paramMap.has('idea_uid')) {
        return route.paramMap.get('idea_uid');
      }
      route = route.firstChild;
    }
    return null;
  }
}
