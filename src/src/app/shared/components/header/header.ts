import { Component,Input } from '@angular/core';
import { HeaderWelcome } from '../header-welcome/header-welcome';
import { RTILogo } from '../rti-logo/rti-logo';

@Component({
  selector: 'app-header',
  imports: [HeaderWelcome, RTILogo],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

}
