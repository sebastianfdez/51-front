import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

// Components
import { LoginComponent } from './login/login.component';
import { ContestsComponent } from './contests/contests.component';
import { AdminComponent } from './admin/admin.component';
import { CategorieComponent } from './categorie/categorie.component';
import { ScoreTableComponent } from './score-table/score-table.component';
import { JudgesComponent } from './judges/judges.component';

// Services
import { AuthGuardService } from './services/auth-guard.service';
import { JudgeAuthGuardService, AdminAuthGuardService } from './services/admin-guard.service';
import { AuthService } from './services/auth.service';
import { SharedModule } from '../shared/shared.module';
import { SpeakerComponent } from './speaker/speaker.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'contests', component: ContestsComponent, canActivate: [JudgeAuthGuardService] },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuardService] },
  { path: 'judges', component: JudgesComponent, canActivate: [AdminAuthGuardService] },
  { path: 'speaker', component: ContestsComponent, canActivate: [AuthGuardService] },
  { path: 'sponsors', component: SpeakerComponent, canActivate: [AdminAuthGuardService] },
  { path: 'categorie/new', component: CategorieComponent, canActivate: [AdminAuthGuardService] },
  { path: 'categorie/:id', component: CategorieComponent, canActivate: [JudgeAuthGuardService] },
  { path: 'categorie/:id/scores', component: ScoreTableComponent, canActivate: [JudgeAuthGuardService] },
  { path: 'categorie/:id/speaker', component: CategorieComponent, canActivate: [AuthGuardService] },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    LoginComponent,
    ContestsComponent,
    AdminComponent,
    CategorieComponent,
    ScoreTableComponent,
    JudgesComponent,
    SpeakerComponent,
  ],
  providers: [
    AuthService,
    AuthGuardService,
    AdminAuthGuardService,
    JudgeAuthGuardService,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class ContestsModule { }
