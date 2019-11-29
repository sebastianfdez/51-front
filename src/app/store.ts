import { State } from './state';
import { BehaviorSubject, Observable } from 'rxjs';
import { pluck, distinctUntilChanged } from 'rxjs/operators';

const state: State = {
  user: undefined,
  contest: undefined,
  judges: undefined,
  speaker: undefined,
};

export class Store {

  private subject = new BehaviorSubject<State>(state);
  private store = this.subject.asObservable().pipe(distinctUntilChanged());

  get value() {
    return this.subject.value;
  }

  select<T>(name: string): Observable<T> {
    return this.store.pipe(pluck(name));
  }

  set(name: string, newState: any) {
    this.subject.next({
      ...this.value, [name]: newState
    });
  }

}