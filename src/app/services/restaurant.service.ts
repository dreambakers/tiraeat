import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { map, mergeMap, switchMap, flatMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  constructor(
    private firestore: AngularFirestore,
    private fireAuth: AngularFireAuth
  ) {}

  createRestaurant(data) {
    return this.fireAuth.authState.pipe(
      switchMap((user) => {
        return this.firestore
        .collection('restaurants')
        .doc(user.email.split('@')[0])
        .set(data)
      })
    );
  }

  getRestaurant() {
    return this.fireAuth.authState.pipe(
      switchMap((user) => {
        return this.firestore
          .collection('restaurants')
          .doc(user.email.split('@')[0])
          .get()
          .pipe(
            map(
              res => {
                if (res.data()) {
                  return {
                    ...res.data() as {},
                    id: res.id
                  }
                }
              }
            )
          )
      })
    );
  }

  updateRestaurant(restaurant, newData) {
    return this.firestore
      .collection('restaurants')
      .doc(restaurant.id)
      .set({ ...newData }, { merge: true });
  }
}
