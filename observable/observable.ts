import { attempt, isError, isFunction } from 'lodash/fp';
import { observerOrNext } from './functions';
import { Subject } from './subject';
import type {
  Teardown,
  Next,
  Observer,
  Subscription,
  Fn,
  ErrorHandler,
  CompleteHandler,
  OperatorFunction,
  ObservableInit,
} from './types';

export class Observable<T> {
  private readonly observers: Set<Observer<T>>;
  private readonly onInit: ObservableInit<T>;

  private _onError?: ErrorHandler;
  private _onComplete?: CompleteHandler;
  private _teardown?: Teardown;

  constructor(func: ObservableInit<T>) {
    this.observers = new Set();
    this.onInit = (observer: Observer<T>) => {
      return func(observer);
    };
  }

  pipe<U>(...operators: OperatorFunction<T, U>[]): Observable<U> {
    return operators.reduce(
      (source: unknown, operator: OperatorFunction<any, any>) => {
        return operator(source);
      },
      this
    );
  }

  next(value: T) {
    this.observers.forEach((observer) => {
      this.attempt(observer, () => {
        observer.next(value);
      });
    });
  }

  private attempt = <R>(source: Observer<T>, fn: Fn<R>) => {
    const res = attempt(fn);
    if (isError(res)) {
      this._onError?.(res);
      this.unsubscribe(source);
    }
    return res;
  };

  error(handler: (error: unknown) => void) {
    this._onError = handler;
  }

  complete(handler: () => void) {
    this._onComplete = handler;
  }

  subscribe(next: Observer<T> | Next<T>): Subscription {
    this.init();
    const observer = observerOrNext(next);
    this.observers.add(observer);
    return {
      unsubscribe: () => {
        if (isFunction(observer.complete)) {
          attempt(observer.complete);
        }
        this.unsubscribe(observer);
      },
    };
  }

  toPromise(): Promise<T> {
    return new Promise((resolve, reject) => {
      const subscription = this.subscribe({
        next: (value) => {
          resolve(value);
          subscription.unsubscribe();
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  unsubscribe(observer: Observer<T>) {
    this.observers.delete(observer);
    if (!this.isActive()) {
      this._teardown?.();
    }
  }

  private init() {
    if (this.isActive()) {
      return;
    }
    const subject = new Subject<T>();
    this._teardown = this.onInit({
      next: (value) => {
        subject.next(value);
      },
      error: (error) => {
        subject.error(error);
      },
      complete: () => {
        subject.complete();
        this._onComplete?.();
      },
    });
    subject.subscribe((value) => {
      this.next(value);
    });
  }

  private isActive() {
    return this.observers.size > 0;
  }
}
