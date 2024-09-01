import { Component, DestroyRef, inject, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { map } from 'rxjs';
import { Place } from '../place.model';
import { HttpClient } from '@angular/common/http';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent {
  isFetching = signal(true);
  error = signal('');
  private destroyRef = inject(DestroyRef);
  private placeService=inject(PlacesService);
  places=this.placeService.loadedUserPlaces;

  ngOnInit() {
    const subscription = this.placeService.loadUserPlaces()
      .subscribe({
        complete: () => {
          this.isFetching.set(false);
        },
        error: (error) => {
          console.error(error);
          this.error.set(error.message);
        },
      });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
  RemovePlace(place:Place){
    const subscription= this.placeService.removeUserPlace(place).subscribe()
    this.destroyRef.onDestroy(()=>{
     subscription.unsubscribe();
    })

  }
  
}
