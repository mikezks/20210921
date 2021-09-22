import {Component} from '@angular/core';
import { FlightService } from '@flight-workspace/flight-lib';


@Component({
  selector: 'sidebar-cmp',
  templateUrl: 'sidebar.component.html',
})

export class SidebarComponent {
  flightsCount$ = this.flightService.flightsCount$;

  constructor(private flightService: FlightService) {}
}
