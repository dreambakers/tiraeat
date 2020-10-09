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
    return new Promise<any>((resolve, reject) => {
      this.firestore
        .collection('restaurants')
        .add(data)
        .then(
          (res) => {},
          (err) => reject(err)
        );
    });
  }

  getRestaurant() {
    return this.fireAuth.authState.pipe(
      switchMap((user) => {
        return this.firestore
          .collection('restaurants', (ref) =>
            ref.where('uid', '==', user.uid).limit(1)
          )
          .snapshotChanges()
          .pipe(
            map((restaurants: any) => {
              if (restaurants.length) {
                const data = restaurants[0].payload.doc.data();
                const id = restaurants[0].payload.doc.id;
                return { id, ...data };
              }
              return false;
            })
          );
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
