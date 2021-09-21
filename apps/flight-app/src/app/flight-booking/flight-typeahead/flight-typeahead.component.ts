import { HttpParams, HttpHeaders, HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Flight } from '@flight-workspace/flight-lib';
import { Observable, timer, EMPTY, Subscription, tap, share, map, of, debounceTime, distinctUntilChanged, filter, switchMap, withLatestFrom } from 'rxjs';

@Component({
  selector: 'flight-workspace-flight-typeahead',
  templateUrl: './flight-typeahead.component.html',
  styleUrls: ['./flight-typeahead.component.css']
})
export class FlightTypeaheadComponent implements OnInit, OnDestroy {
  timer$: Observable<number> = EMPTY;
  subscription = new Subscription();

  control = new FormControl();
  flights$: Observable<Flight[]> = of([]);
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const filterState = of({
      cityFilter: 'Wien',
      username:'michael.egger-zikes'
    });

    // Stream 3: Result stream to render Flights
    this.flights$ =
      // Stream 1: Input field value changes
      // Trigger: User enters text
      // Data Provider: City name to filter HTTP call
      this.control.valueChanges.pipe(
        // Stream 4: Filter State
        // Data Provider
        withLatestFrom(filterState),
        map(([userFilter, { cityFilter }]) => userFilter),
        // Filtering START
        filter(city => city.length > 2),
        debounceTime(300),
        distinctUntilChanged(),
        // Filtering END
        // Side-Effect: Assign class property "loading"
        tap(() => this.loading = true),
        // Stream 2: Switch to inner Observable to load data
        // Data Provider
        switchMap(city => this.load(city)),
        // Side-Effect: Assign class property "loading"
        tap(() => this.loading = false)
      );

    // this.rxjsDemo();
  }

  // Stream 2: HTTP call responds with Flights
  load(from: string): Observable<Flight[]>  {
    const url = "http://www.angular.at/api/flight";

    const params = new HttpParams()
                        .set('from', from);

    const headers = new HttpHeaders()
                        .set('Accept', 'application/json');

    return this.http.get<Flight[]>(url, {params, headers});
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
