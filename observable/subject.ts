import { observerOrNext } from './functions';
import type { Observer } from './types';
import type { Next } from './types';

export class Subject<T> {
  private observers = new Set<Observer<T>>();

  next(value: T) {
    this.observers.forEach((observer) => observer.next(value));
  }

  error(error: unknown) {
    this.observers.forEach((observer) => observer.error?.(error));
  }

  complete() {
    this.observers.forEach((observer) => observer.complete?.());
    this.observers.clear();
  }

  subscribe(next: Observer<T> | Next<T>) {
    const observer = observerOrNext(next);
    this.observers.add(observer);
    return {
      unsubscribe: () => {
        this.observers.delete(observer);
      },
    };
  }
}
