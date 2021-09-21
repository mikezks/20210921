import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, timer, EMPTY, Subscription, tap, share, map, of } from 'rxjs';

@Component({
  selector: 'flight-workspace-flight-typeahead',
  templateUrl: './flight-typeahead.component.html',
  styleUrls: ['./flight-typeahead.component.css']
})
export class FlightTypeaheadComponent implements OnInit, OnDestroy {
  timer$: Observable<number> = EMPTY;
  subscription = new Subscription();

  constructor() { }

  ngOnInit(): void {
    // this.rxjsDemo();
  }

  rxjsDemo(): void {
    this.timer$ = timer(0, 1_000).pipe(
      tap(value => console.log('Observable processing', value)),
      share()
    );
    this.subscription.add(
      this.timer$.subscribe(console.log)
    );

    of([
      'London',
      'Rio',
      'NY'
    ]).pipe(
      map(([city1, city2, city3]) => city2),
      map(city => ({
        id: 5,
        cityName: city,
        country: 'UK'
      }))
    ).subscribe(console.log);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
