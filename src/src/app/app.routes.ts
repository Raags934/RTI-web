import { Routes } from '@angular/router';
import { IdeaDashboard } from './features/ideas/idea-dashboard/idea-dashboard';
import { IdeaCreate } from './features/ideas/idea-create/idea-create';
import { MyIdeas } from './features/ideas/my-ideas/my-ideas';
import { ContactForHelp } from './features/contact-for-help/contact-for-help';
import { IdeaView } from './features/ideas/idea-view/idea-view';
import { IdeaEdit } from './features/ideas/idea-edit/idea-edit';
import { PrioritizationOne } from './features/prioritization-one/prioritization-one';
import { PrioritizationTwo } from './features/prioritization-two/prioritization-two';

export const routes: Routes = [
  { path: '', component: IdeaDashboard },
  { path: 'addidea', component: IdeaCreate },
  { path: 'myideas', component: MyIdeas },
  { path: 'help', component: ContactForHelp },
  { path: 'ideas/:idea_uid', component: IdeaView },
  { path: 'ideas/:idea_uid/edit', component: IdeaEdit },
  { path: 'prioritization', component: PrioritizationOne },
  { path: 'ta-prioritization', component: PrioritizationTwo },
];
