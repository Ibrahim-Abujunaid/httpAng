import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { catchError, map, tap, throwError } from 'rxjs';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);
  private httpClient = inject(HttpClient);
  private error=inject(ErrorService)

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces('http://localhost:3000/places');
  }

  loadUserPlaces() {
    return this.fetchPlaces('http://localhost:3000/user-places').pipe(
      tap({
        next: (userPlaces) => this.userPlaces.set(userPlaces),
      })
    );
  }

  addPlaceToUserPlaces(place: Place) {
    const prevPlaces = this.userPlaces();
    if (!prevPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set([...prevPlaces, place]);
    }

    return this.httpClient
      .put('http://localhost:3000/user-places', {
        placeId: place.id,
      })
      .pipe(
        catchError((error) => {
          this.error.showError('there is some error')
          this.userPlaces.set(prevPlaces);
          return throwError(()=>new Error('Failed to access'));
        })
      );
  }

  removeUserPlace(place: Place) {
    const prevPlaces = this.userPlaces();
    if (prevPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set(prevPlaces.filter((p)=>p.id !==place.id));
    }
    return this.httpClient.delete('http://localhost:3000/user-places/'+place.id).pipe(
      catchError((error) => {
        this.error.showError('there is some error in remove item')
        this.userPlaces.set(prevPlaces);
        return throwError(()=>new Error('Failed to access'));
      })
    );

  }

  private fetchPlaces(url: string) {
    return this.httpClient
      .get<{ places: Place[] }>(url)
      .pipe(map((resData) => resData.places));
  }
}
