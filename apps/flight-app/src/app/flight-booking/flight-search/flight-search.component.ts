/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import {Component, OnInit} from '@angular/core';
import {Flight} from '@flight-workspace/flight-lib';
import { Store } from '@ngrx/store';
import { ComponentStore } from '@ngrx/component-store';
import { first, Observable, tap } from 'rxjs';
import * as fromFlightBooking from '../+state';


export interface Filter {
  from: string;
  to: string;
  urgent: boolean;
}

export interface LocalState {
  flights: Flight[];
  filters: Filter[];
}

export const initalLocalState: LocalState = {
  flights: [],
  filters: []
}


@Component({
  selector: 'flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css'],
  providers: [ ComponentStore ]
})
export class FlightSearchComponent implements OnInit {

  from = 'Hamburg'; // in Germany
  to = 'Graz'; // in Austria
  urgent = false;

  // "shopping basket" with selected flights
  basket: { [id: number]: boolean } = {
    3: true,
    5: true
  };

  /**
   * Updater
   */

  addFilter = this.localStore.updater(
    (state, filter: Filter) => ({
      ...state,
      filters: [
        ...state.filters,
        filter
      ]
    })
  );

  updateFlights = this.localStore.updater(
    (state, flights: Flight[]) => ({
      ...state,
      flights
    })
  );

  /**
   * Selectors
   */

  selectFilters$ = this.localStore.select(
    // Selectors
    // Projector
    state => state.filters
  );
  selectFlights$ = this.localStore.select(state => state.flights);
  selectCurrentFilter$ = this.localStore.select(
    state => state.filters[state.filters.length - 1]
  );

  /**
   * Effects
   */

  searchFlights = this.localStore.effect(
    (filterChange$: Observable<Filter>) =>
      filterChange$.pipe(tap((filter: Filter) =>
        this.globalStore.dispatch(
          fromFlightBooking.flightsLoad(filter)
        )
      )
    )
  );

  constructor(
    private localStore: ComponentStore<LocalState>,
    private globalStore: Store) {}

  ngOnInit() {
    this.localStore.setState(initalLocalState);

    this.updateFlights(
      this.globalStore.select(fromFlightBooking.selectFlights)
    );

    this.searchFlights(this.selectCurrentFilter$);
  }

  search(): void {
    if (!this.from || !this.to) return;

    this.addFilter({ from: this.from, to: this.to, urgent: this.urgent });
  }

  delay(): void {
    this.selectFlights$.pipe(first()).subscribe(flights => {

      const flight = {
        ...flights[0],
        date: addMinutesToDate(flights[0].date, 15).toISOString(),
        delayed: true
      };
      this.globalStore.dispatch(fromFlightBooking.flightUpdate({flight}))

    });
  }
}

export const addMinutesToDate = (date: Date | string, minutes: number): Date => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Date(dateObj.getTime() + minutes * 60 * 1_000);
};
