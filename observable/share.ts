import { Observable } from './observable';
import { Subject } from './subject';
import type { Subscription } from './types';

export class Share<T> extends Observable<T> {
  private readonly subject: Subject<T>;
  private subscription: Subscription | null = null;

  constructor(source: Observable<T>, subject?: Subject<T>) {
    super((observer) => {
      const subscription = this.subject.subscribe(observer);
      if (!this.subscription) {
        this.subscription = source.subscribe(this.subject);
      }
      return subscription.unsubscribe;
    });
    this.subject = subject ?? new Subject<T>();
  }
}
