import { Routes } from '@angular/router';
import { IdeaDashboard } from './features/ideas/idea-dashboard/idea-dashboard';
import { IdeaCreate } from './features/ideas/idea-create/idea-create';
import { MyIdeas } from './features/ideas/my-ideas/my-ideas';
import { ContactForHelp } from './features/contact-for-help/contact-for-help';
import { IdeaView } from './features/ideas/idea-view/idea-view';
import { Harmonizer } from './features/harmonizer/harmonizer';
import { AdminProduct } from './features/admin/admin-product/admin-product';

export const routes: Routes = [
  { path: '', component: IdeaDashboard },
  { path: 'addidea', component: IdeaCreate },
  { path: 'myideas', component: MyIdeas },
  { path: 'help', component: ContactForHelp },
  { path: 'ideas/:idea_uid', component: IdeaView },
  { path: 'harmonizer', component: Harmonizer },
  { path: 'admin', component: AdminProduct }
];
