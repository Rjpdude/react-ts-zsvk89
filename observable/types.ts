/* eslint-disable @typescript-eslint/naming-convention */
import type { Observable } from './observable';

export interface Observer<T> {
  next(value: T): void;
  error?(error: unknown): void;
  complete?(): void;
}

export interface SubscriptionLike<T = unknown> {
  subscribe: (handle: Next<T>) => Subscription;
}

export interface Subscription {
  unsubscribe(): void;
}

export type OperatorFunction<A, B> = (source: Observable<A>) => Observable<B>;
export type ObservableInit<T> = (observer: Observer<T>) => Teardown;
export type Next<T> = (value: T) => void;
export type ErrorHandler<Error = unknown> = (error: Error) => void;
export type CompleteHandler = () => void;
export type Teardown = () => void;
export type Fn<R> = () => R;
