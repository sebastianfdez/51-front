import { Injectable } from '@angular/core';
import { Store } from '../../store';
import { Observable, of } from 'rxjs';
import { Contest } from '../../shared/models/contest';
import { switchMap, take, catchError } from 'rxjs/operators';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Categorie } from '../models/categorie';
import { Speaker } from '../models/speaker';

@Injectable({
    providedIn: 'root'
})
    export class ContestsService {

    constructor(
        private store: Store,
        private firebaseService: FirebaseService,
    ) { }

    getContest(idContest: string): Observable<Contest> {
        return this.store.value.contest ? this.store.select<Contest>('contest') :
        this.firebaseService.getContest(idContest).pipe(
            switchMap((contest) => {
                const contest_ = {id: idContest, ...contest};
                this.store.set('contest', contest_);
                return this.store.select<Contest>('contest');
            })
        );
    }

    getCategorie(categorieId: string): Observable<Categorie> {
        return this.store.value[`categorie${categorieId}`] ? this.store.select<Categorie>(`categorie${categorieId}`).pipe(take(1)) :
        this.firebaseService.getCategorie(categorieId).pipe(
            catchError((error) => {
                console.log(error);
                return of(null);
            }),
            switchMap((categorie: Categorie) => {
                if (categorie) {
                    categorie.id = categorieId;
                    this.store.set(`categorie${categorieId}`, categorie);
                    return this.store.select<Categorie>(`categorie${categorieId}`).pipe(take(1));
                } else {
                    return of(null);
                }
            })
        );
    }

    addNewCategorie(contestId: string, categorieId: string) {
        const categories: string[] = this.store.value.contest.categories;
        categories.push(categorieId);
        this.store.set('contest', Object.assign(this.store.value.contest, { categories }));
        this.firebaseService.updateContest(contestId, { categories });
    }

    deleteCategorie(contestId: string, categorieId: string) {
        const categories: string[] = this.store.value.contest.categories.filter(cat => cat !== categorieId);
        this.store.set('contest', Object.assign(this.store.value.contest, { categories }));
        this.firebaseService.updateContest(contestId, { categories });
    }

    getSpeaker(): Observable<Speaker> {
        return this.store.value.speaker ? this.store.select<Speaker>('speaker').pipe(take(1)) :
        this.store.select<Contest>('contest').pipe(
            switchMap((contest) => {
                return this.firebaseService.getSpeaker(contest.speaker);
            }),
            switchMap((snapshot) => {
                const speaker: Speaker = snapshot.payload.data();
                this.store.set('speaker', speaker);
                return this.store.select<Speaker>('speaker');
            })
        );
    }
}
