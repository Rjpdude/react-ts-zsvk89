import { Observable } from './observable';
import { Share } from './share';
import { isFunction, throttle } from 'lodash/fp';
import type { Next, Observer, OperatorFunction } from './types';

export function share<T>(source: Observable<T>) {
  return new Share(source);
}

export function observerOrNext<T>(
  observer: Observer<T> | Next<T>
): Observer<T> {
  return isFunction(observer)
    ? {
        next: observer,
      }
    : observer;
}

export function throttleTime<T>(time: number) {
  const res = throttle(time, (fn) => {
    fn();
  });
  return fromSource<T, T>((observer) => ({
    next: (value) =>
      res(() => {
        observer.next(value);
      }),
  }));
}

export function fromSource<T, R>(
  arg: Next<Observer<R>>
): OperatorFunction<T, R> {
  return (source: Observable<T>): Observable<R> =>
    new Observable<R>((observer) => {
      const handle = isFunction(arg) ? arg(observer) : arg;
      const sub = source.subscribe({
        next: handle.next ?? observer.next,
        error: handle.error ?? observer.error,
        complete: handle.complete ?? observer.complete,
      });
      return sub.unsubscribe;
    });
}
