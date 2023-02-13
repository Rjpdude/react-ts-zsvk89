import { noop } from 'lodash/fp';
import { fromSource } from '../functions';
import { Observable } from '../observable';
import type { OperatorFunction } from '../types';

/**
 * The basic set of variadic functions - a work in progress. Typescript
 * is a pain with this. Only a few more to go.
 */

export const map = <T, R>(projection: (value: T) => R) => {
  return fromSource((observer) => ({
    next(value) {
      observer.next(projection(value));
    },
  }));
};

/**
 * Todo: Generalize as a reusable generic operator fn.
 */
export function tap<T>(
  nextFn: (value: T) => void,
  errorFn?: (error: unknown) => void,
  completeFn?: () => void
): OperatorFunction<T, T> {
  return (source: Observable<T>) => {
    return new Observable<T>((observer) => {
      const sub = source.subscribe({
        next: (value) => {
          nextFn(value);
          observer.next(value);
        },
        error: (error) => {
          if (errorFn) {
            errorFn(error);
          }
          observer.error?.(error);
        },
        complete: () => {
          if (completeFn) {
            completeFn();
          }
          observer.complete?.();
        },
      });
      return () => sub.unsubscribe();
    });
  };
}

export function fromPromise<T>(promise: Promise<T>) {
  return new Observable<T>((observer) => {
    promise.then(
      (value) => {
        observer.next(value);
        observer.complete?.();
      },
      (error) => {
        observer.error?.(error);
      }
    );
    return () => {
      promise.catch(noop);
    };
  });
}

export function uiEvent<T extends Event>(
  target: EventTarget,
  eventType: string,
  options?: AddEventListenerOptions
) {
  return new Observable<T>((observer) => {
    function onEvent(event: Event) {
      // @ts-expect-error
      observer.next(event);
    }
    target.addEventListener(eventType, onEvent, options);
    return () => {
      target.removeEventListener(eventType, onEvent, options);
    };
  });
}
