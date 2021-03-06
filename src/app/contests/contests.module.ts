import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { UploadModule } from '@progress/kendo-angular-upload';
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { AuthFormModule } from '../auth/auth-form/auth-form.module';

// Components
import { ContestsComponent } from './components/contests/contests.component';
import { AdminComponent } from './components/admin/admin.component';
import { CategorieComponent } from './components/categorie/categorie.component';
import { ScoreTableComponent } from './components/score-table/score-table.component';
import { JudgesComponent } from './components/judges/judges.component';
import { SpeakerComponent } from './components/speaker/speaker.component';
import { PortalComponent } from './components/portal/portal.component';
import { NewContestComponent } from './components/new-contest/new-contest.component';
import { CategoryOpenComponent } from './components/category-open/category-open.component';
import { PlayerPortalComponent } from './components/player-portal/player-portal.component';

// Services
import { AuthGuardService } from '../auth/auth-form/services/auth-guard.service';
import { AdminAuthGuardService } from './services/admin-guard.service';
import { JudgeAuthGuardService } from './services/judge-guard.service';
import { CategorieResolve } from './resolvers/categorie.resolve';
import { JudgeResolve } from './resolvers/judge.resolve';
import { ContestsService } from './services/contest.service';
import { SelectedContestGuardService } from './services/selected-contest-guard.service';
import { ExcelHelperService } from './services/excel-helper.service';
import { PlayerGuardService } from './services/player-guard.service';
import { CategoryFormModule } from './category-form/category-form.module';

const routes: Routes = [
    {
        path: '',
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'portal' },
            { path: 'portal', component: PortalComponent, canActivate: [AuthGuardService, PlayerGuardService] },
            {
                path: 'contests',
                component: ContestsComponent,
                canActivate: [
                    JudgeAuthGuardService,
                    SelectedContestGuardService,
                ],
            },
            {
                path: 'admin',
                component: AdminComponent,
                canActivate: [AuthGuardService, SelectedContestGuardService, PlayerGuardService],
            },
            {
                path: 'judges',
                component: JudgesComponent,
                canActivate: [
                    AdminAuthGuardService,
                    SelectedContestGuardService,
                    PlayerGuardService,
                ],
                resolve: {
                    judges: JudgeResolve,
                },
            },
            {
                path: 'new',
                component: NewContestComponent,
                canActivate: [AuthGuardService, SelectedContestGuardService, PlayerGuardService],
            },
            { path: 'speaker', component: ContestsComponent, canActivate: [AuthGuardService, SelectedContestGuardService] },
            { path: 'player', component: PlayerPortalComponent, canActivate: [AuthGuardService] },
            { path: 'sponsors', component: SpeakerComponent, canActivate: [AdminAuthGuardService, SelectedContestGuardService] },
            {
                path: 'categorie/:id',
                component: CategorieComponent,
                canActivate: [
                    JudgeAuthGuardService,
                    SelectedContestGuardService,
                    PlayerGuardService,
                ],
                resolve: {
                    categorie: CategorieResolve,
                },
            },
            {
                path: 'categorie-open/:id',
                component: CategoryOpenComponent,
                canActivate: [
                    JudgeAuthGuardService,
                    SelectedContestGuardService,
                    PlayerGuardService,
                ],
                resolve: {
                    categorie: CategorieResolve,
                },
            },
            {
                path: 'categorie/:id/scores',
                component: ScoreTableComponent,
                canActivate: [
                    JudgeAuthGuardService,
                    SelectedContestGuardService,
                    PlayerGuardService,
                ],
                resolve: {
                    categorie: CategorieResolve,
                    judges: JudgeResolve,
                },
            },
            {
                path: 'categorie/:id/speaker',
                component: CategorieComponent,
                canActivate: [AuthGuardService, SelectedContestGuardService, PlayerGuardService],
                resolve: {
                    categorie: CategorieResolve,
                },
            },
        ],
    },
];

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
        GridModule,
        ExcelModule,
        UploadModule,
        AuthModule,
        AuthFormModule,
        CategoryFormModule,
    ],
    declarations: [
        ContestsComponent,
        AdminComponent,
        CategorieComponent,
        ScoreTableComponent,
        JudgesComponent,
        SpeakerComponent,
        PortalComponent,
        NewContestComponent,
        CategoryOpenComponent,
        PlayerPortalComponent,
    ],
    providers: [
        AdminAuthGuardService,
        JudgeAuthGuardService,
        SelectedContestGuardService,
        CategorieResolve,
        JudgeResolve,
        ContestsService,
        ExcelHelperService,
        PlayerGuardService,
    ],
    exports: [
        RouterModule,
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ],
})
export class ContestsModule { }
