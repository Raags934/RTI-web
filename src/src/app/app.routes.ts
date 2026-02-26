import { Routes } from '@angular/router';
import { IdeaDashboard } from './features/ideas/idea-dashboard/idea-dashboard';
import { IdeaCreate } from './features/ideas/idea-create/idea-create';
import { MyIdeas } from './features/ideas/my-ideas/my-ideas';
import { ContactForHelp } from './features/contact-for-help/contact-for-help';
import { IdeaView } from './features/ideas/idea-view/idea-view';
import { IdeaEdit } from './features/ideas/idea-edit/idea-edit';
import { IdeaDraftEdit } from './features/ideas/idea-draft-edit/idea-draft-edit';
import { PrioritizationOne } from './features/prioritization-one/prioritization-one';
import { PrioritizationTwo } from './features/prioritization-two/prioritization-two';
import { Harmonizer } from './features/harmonizer/harmonizer';
import { Funding } from './features/funding/funding';
import { AdminHome } from './features/admin/admin-home/admin-home';
import { ManageUser } from './features/admin/manage-user/manage-user';
import { AdminProduct } from './features/admin/admin-product/admin-product';
import { LoginComponent } from './core/components/login/login.component';
import { CallbackComponent } from './core/components/callback/callback.component';
import { AccessDeniedComponent } from './core/components/access-denied/access-denied.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: '', component: IdeaDashboard, canActivate: [authGuard] },
  { path: 'addidea', component: IdeaCreate, canActivate: [authGuard] },
  { path: 'myideas', component: MyIdeas, canActivate: [authGuard] },
  { path: 'help', component: ContactForHelp, canActivate: [authGuard] },
  { path: 'ideas/:idea_uid', component: IdeaView, canActivate: [authGuard] },
  { path: 'ideas/:idea_uid/edit-draft', component: IdeaDraftEdit, canActivate: [authGuard] },
  { path: 'ideas/:idea_uid/edit', component: IdeaEdit, canActivate: [authGuard] },
  { path: 'productprioritization', component: PrioritizationOne, canActivate: [authGuard] },
  { path: 'taprioritization', component: PrioritizationTwo, canActivate: [authGuard] },
  { path: 'harmonizer', component: Harmonizer, canActivate: [authGuard] },
  { path: 'funding', component: Funding, canActivate: [authGuard] },
  { path: 'admin', component: AdminHome, canActivate: [authGuard] },
  { path: 'admin/users', component: ManageUser, canActivate: [authGuard] },
  { path: 'admin/products', component: AdminProduct, canActivate: [authGuard] },
];
