import { useEffect } from 'react';
import type { Next } from '../types';
import type { Observable } from '../observable';

/**
 * A hook for taping into observable data within a React UI component. As
 * a general rule of thumb, data flowing through observables should stay there -
 * copying data to localized state or caching elsewhere is an anti-pattern.
 *
 * @param observable Any observable instance.
 * @param next Callback for the next observable value.
 */
export function useObservable<T>(
  observable: Observable<T>,
  onNextEvent: Next<T>
) {
  useEffect(() => {
    const subcription = observable.subscribe((value) => {
      onNextEvent(value);
    });
    return () => subcription.unsubscribe();
  }, []);
}
