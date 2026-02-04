import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import {MatIconModule} from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { menuItems } from '../../constants/sidebar';

@Component({
  selector: 'app-sidebar',
  imports: [ RouterModule,CommonModule, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  menuClosed: boolean = false;
  menuItems = menuItems;

  constructor(private router: Router) {}

  onMenuclick(): void {
    this.menuClosed = !this.menuClosed;
  }

  gotoHome(): void {
    this.router.navigate(['/']);
  }
 
}