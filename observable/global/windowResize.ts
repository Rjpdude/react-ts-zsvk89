import { prop } from 'lodash/fp';
import { uiEvent, tap } from '../util/operators';
import { share, throttleTime } from '../functions';

export const innerWidth = prop('innerWidth');
export const innerHeight = prop('innerHeight');

/**
 * An `Observable<UIEvent>` that broadcasts changes to the window size in
 * a shared event pipeline.
 */
export const windowResize$ = share(uiEvent<UIEvent>(window, 'resize'));

/**
 * An example of tapping into a pipeline, intercepting it (here with a 1.5s throttle)
 * then continuing. Check out your console log!
 */
export const throttledResizeEvent$ = share(
  windowResize$.pipe(
    tap((event) => {
      console.log(`Intercepted ${event.type} - pending 1s throttle.`);
    }),
    throttleTime(1500),
    tap((event) => {
      console.log(`Cleared ${event.type} - continuing with event.`);
    })
  )
);
