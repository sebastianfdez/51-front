import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Sort } from '@angular/material/sort';
import { ExcelExportComponent } from '@progress/kendo-angular-excel-export';
import { switchMap, tap } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { Store } from 'store';
import { WarningService } from '../../../shared/warning/warning.service';
import { WarningReponse } from '../../../shared/warning/warning.component';
import { Contest } from '../../../shared/models/contest';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { ContestsService } from '../../services/contest.service';
import {
    Categorie, Participant, emptyCategorie,
} from '../../models/categorie';
import { User } from '../../../shared/models/user';

export interface ScoreElement {
    pool: string;
    name: string;
    participantName: string;
    participantLastName: string;
    licence: string;
    average: string;
    calification: string;
    club: string;
    idPlayer: string;
    [idJudge: string]: string;
}

@Component({
    selector: 'app-score-table',
    templateUrl: './score-table.component.html',
    styleUrls: ['./score-table.component.scss'],
})
export class ScoreTableComponent implements OnInit, OnDestroy {
    public categorie: Categorie = null;

    public judges: User[] = [];

    public dataSource: ScoreElement[] = [];

    displayedColumns: string[] = [];

    loading = false;

    contest: Contest = null;

    subscriptions: Subscription[] = [];

    constructor(
        private route: ActivatedRoute,
        private warningService: WarningService,
        private router: Router,
        private firebaseService: FirebaseService,
        private contestService: ContestsService,
        private store: Store,
    ) {}

    ngOnInit() {
        this.subscriptions.push(
            this.route.data.pipe(
                switchMap((data: {categorie: Categorie; judges: User[];}) => {
                    this.judges = data.judges;
                    this.categorie = data.categorie;
                    this.getTableData();
                    return this.store.select<Contest>('selectedContest');
                }),
                tap((contest) => {
                    this.loading = false;
                    this.contest = contest;
                    if (contest.isPublic) {
                        this.displayedColumns = ['calification', 'name', 'club'];
                    } else {
                        this.displayedColumns = ['calification', 'name', 'licence'];
                    }
                    this.judges.forEach((judge) => {
                        this.displayedColumns.push(`${judge.name}${judge.lastName}`);
                    });
                    if (contest.isPublic) {
                        this.displayedColumns.push('average');
                    } else {
                        this.displayedColumns.push('average', 'pool');
                    }
                }),
            ).subscribe(),
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    getTableData() {
        this.dataSource = [];
        this.categorie.pools.forEach((pool, index) => {
            pool.participants.forEach((participant) => {
                const newScore: ScoreElement = {
                    pool: `${index}`,
                    name: `${participant.name} ${participant.lastName}`,
                    participantLastName: participant.lastName,
                    participantName: participant.name,
                    licence: participant.licence,
                    average: '0',
                    calification: '1',
                    club: participant.club,
                    idPlayer: participant.id,
                };
                let totalVotes = 0;
                let totalScore = 0;
                if (participant.votes) {
                    participant.votes.forEach((vote) => {
                        newScore[vote.codeJuge] = `${vote.note ? vote.note : 0}`;
                    });
                    participant.votes.forEach((vote) => {
                        totalVotes++;
                        totalScore += 1 * (vote.note as number);
                    });
                }
                newScore.average = `${totalVotes ? (Math.round((totalScore / totalVotes) * 100) / 100) : 0}`;
                this.dataSource.push(newScore);
            });
        });
        this.dataSource = this.dataSource.sort(
            (a, b) => (this.parseInt(a.average) > this.parseInt(b.average) ? -1 : 1),
        );
        this.dataSource.forEach((data, index) => {
        // eslint-disable-next-line no-param-reassign
            data.calification = `${index + 1}`;
        });
    }

    sortData(sort: Sort) {
        const data = this.dataSource.slice();
        if (!sort.active || sort.direction === '') {
            this.dataSource = data;
            return;
        }

        this.dataSource = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'pool': return this.compareNumber(this.parseInt(a.pool), this.parseInt(b.pool), isAsc);
                case 'name': return this.compare(a.name, b.name, isAsc);
                case 'licence': return this.compare(a.licence, b.licence, isAsc);
                case 'club': return this.compare(a.club, b.club, isAsc);
                case 'average': return this.compareNumber(this.parseInt(a.average), this.parseInt(b.average), isAsc);
                case 'calification': return this.compareNumber(this.parseInt(a.calification), this.parseInt(b.calification), isAsc);
                default: return 0;
            }
        });
    }

    // eslint-disable-next-line class-methods-use-this
    compare(a: string, b: string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    // eslint-disable-next-line class-methods-use-this
    compareNumber(a: number, b: number, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    // Exporter excel
    save(component: ExcelExportComponent): void {
        const options = component.workbookOptions();
        // Add title, date and name of the categorie
        options.sheets[0].rows.unshift({
            cells: [{
                background: '#2c50a5',
                color: '#FFFFFF',
                value: '',
                fontSize: 20,
                textAlign: 'left',
            }, {
                background: '#2c50a5',
                color: '#FFFFFF',
                // eslint-disable-next-line no-nested-ternary
                value: this.categorie ? this.categorie.final ? 'Finale' : 'Qualifications' : '',
                fontSize: 20,
                textAlign: 'left',
            }, {
                background: '#2c50a5',
                color: '#FFFFFF',
                value: (new Date()).toLocaleDateString(),
                fontSize: 20,
                colSpan: 3,
                textAlign: 'right',
            }],
            height: 30,
        });
        options.sheets[0].rows.unshift({
            cells: [{
                background: '#2c50a5',
                color: '#FFFFFF',
                value: '',
                fontSize: 30,
            }, {
                background: '#2c50a5',
                color: '#FFFFFF',
                value: this.categorie ? this.categorie.name.replace(' Finale', '') : '',
                fontSize: 30,
            }, {
                background: '#2c50a5',
                color: '#FFFFFF',
                value: this.store.value.selectedContest.place,
                fontSize: 30,
                colSpan: 3,
                textAlign: 'right',
            }],
            height: 40,
        });
        options.sheets[0].rows.unshift({
            cells: [{
                background: '#2c50a5',
                color: '#FFFFFF',
                value: '',
                fontSize: 40,
                textAlign: 'center',
            }, {
                background: '#2c50a5',
                color: '#FFFFFF',
                value: this.store.value.selectedContest.name,
                fontSize: 40,
                textAlign: 'center',
                colSpan: 4,
            }],
            height: 50,
        });
        component.save(options);
    }

    getFileName() {
        return `Classement ${this.categorie ? this.categorie.name : ''}`;
    }

    // eslint-disable-next-line class-methods-use-this
    getVote(element: ScoreElement, judge: User) {
        return judge.id && element[judge.id] ? element[judge.id] : 0;
    }

    // eslint-disable-next-line class-methods-use-this
    parseInt(num: string): number {
        return parseFloat(num);
    }

    createFinal() {
        let limit = 0;
        this.subscriptions.push(
            this.warningService
                .showWarning(null, true, 'Combien de riders sont qualifiés pour la finale?')
                .afterClosed()
                .pipe(
                    switchMap((response: WarningReponse) => {
                        if (response.accept && response.input) {
                            limit = response.input;
                            return this.warningService
                                .showWarning(
                                    'Es-tu sûr de vouloir générer la finale ?',
                                    true,
                                    'Combien de riders par poule?',
                                )
                                .afterClosed();
                        }
                        return of({ accept: false });
                    }),
                    switchMap((response: WarningReponse) => {
                        if (response.accept && response.input) {
                            const newCategorie: Categorie = JSON.parse(
                                JSON.stringify(emptyCategorie),
                            );
                            newCategorie.final = true;
                            newCategorie.name = `${this.categorie.name} Finale`;
                            newCategorie.contest = this.categorie.contest;
                            const ridersPool: number = response.input;
                            const pools: { participants: Participant[]; }[] = [];
                            let pool: Participant[] = [];
                            this.dataSource.sort((a, b) => (a.average > b.average ? -1 : 1))
                                .slice(0, limit)
                                .reverse()
                                .forEach((participant, index) => {
                                    if (index % ridersPool === 0 && index !== 0) {
                                        pools
                                            .push({
                                                participants: JSON.parse(JSON.stringify(pool)),
                                            });
                                        pool = [{
                                            licence: participant.licence,
                                            club: participant.club,
                                            name: participant.name.split(' ')[0],
                                            lastName: participant.name.split(' ')[1],
                                            id: participant.idPlayer,
                                            votes: [],
                                            mail: '',
                                            isUser: false,
                                        }];
                                    } else {
                                        pool.push({
                                            licence: participant.licence,
                                            club: participant.club,
                                            name: participant.name.split(' ')[0],
                                            lastName: participant.name.split(' ')[1],
                                            id: participant.idPlayer,
                                            votes: [],
                                            mail: '',
                                            isUser: false,
                                        });
                                    }
                                });
                            pools.push({ participants: pool });
                            newCategorie.pools = pools;
                            return this.firebaseService.addCategorie(newCategorie);
                        }
                        return of(null);
                    }),
                )
                .subscribe((doc) => {
                    if (doc) {
                        this.contestService.addNewCategorie(this.categorie.contest, doc.id);
                        this.router.navigate(['portal/contests']);
                    }
                }),
        );
    }
}
