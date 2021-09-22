import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';

import * as FlightBookingActions from './flight-booking.actions';
import { FlightService } from '@flight-workspace/flight-lib';
import { of } from 'rxjs';



@Injectable()
export class FlightBookingEffects {

  loadFlights$ = createEffect(() => this.actions$.pipe(
    ofType(FlightBookingActions.flightsLoad),
    switchMap(action => this.flightService.find(
      action.from,
      action.to,
      action.urgent
    ).pipe(
      map(flights => FlightBookingActions.flightsLoadedSuccess({ flights })),
      catchError(err => of(FlightBookingActions.flightsLoadedFailure({ error: err })))
    ))
  ));

  constructor(
    private actions$: Actions,
    private flightService: FlightService) {}

}
