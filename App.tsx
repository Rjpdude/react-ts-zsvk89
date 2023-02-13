import * as React from 'react';
import { throttledResizeEvent$ } from './observable/global/windowResize';
import { Observable } from './observable/observable';
import { Subject } from './observable/subject';
import { map } from './observable/util/operators';
import { useObservable } from './observable/util/useObservable';
import './style.css';

// What about an observable that emits 2 random numbers ever 3 seconds
// and then another observer so it flows upwards on the screen?

const randomNumberObservable = new Observable<number[]>((observer) => {
  const id = setTimeout(() => {
    observer.next([Math.random() * 10, Math.random() * 10]);
  }, 3000);
  return () => clearInterval(id);
});

const piped = randomNumberObservable.pipe(map((v) => v.reverse()));
const output = randomNumberObservable.subscribe({
  next: (n) => console.log(`got ${n}`),
  error: (e) => console.error(e),
  complete: () => console.log('completed'),
});
randomNumberObservable.subscribe(new Subject().subscribe(piped));

export default function App() {
  useObservable(throttledResizeEvent$, (event) => {
    console.log('window resize event', event);
  });

  return (
    <div>
      <h1>Hello StackBlitz!</h1>
      <p>Start editing to see some magic happen :)</p>
    </div>
  );
}
