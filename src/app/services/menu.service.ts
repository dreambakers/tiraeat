import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { switchMap, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(
    private firestore: AngularFirestore,
    private fireAuth: AngularFireAuth
  ) { }

  addMeal(data) {
    return this.fireAuth.authState.pipe(
      switchMap((user) => {
        return this.getMenu().pipe(
          take(1),
          switchMap(
            meals => {
              const mealId = (`${user.email.split('@')[0]}${meals.length + 1}`)
              return this.firestore
              .collection('menu')
              .doc(mealId)
              .set({...data, restName: user.email.split('@')[0]})
              .then(
                res => {
                  return {...data, id: mealId, restName: user.email.split('@')[0] }
                }
              )
            }
          )
        )
      })
    );
  }

  getMenu() {
    return this.fireAuth.authState.pipe(
      switchMap((user) => {
        return this.firestore
        .collection('menu', (ref) =>
          ref.where('restName', '==', user.email.split('@')[0])
        )
        .snapshotChanges()
        .pipe(
          map(menuItems => {
            return menuItems.map(
              menuItem => ({
                ...menuItem.payload.doc.data() as {},
                id: menuItem.payload.doc.id
              })
            );
          })
        )
      })
    );
  }

  getCommonObj() {
    return this.fireAuth.authState.pipe(
      switchMap((user) => {
        return this.firestore
          .collection('menu')
          .doc(`${user.email.split('@')[0]}Common`)
          .get()
          .pipe(
            map(
              res => res.data()
            )
          )
      })
    );
  }

  updateCommonObject(newData) {
    return this.fireAuth.authState.pipe(
      switchMap((user) => {
        return this.firestore
        .collection('menu')
        .doc(`${user.email.split('@')[0]}Common`)
        .set({ ...newData, restName: user.email.split('@')[0] }, { merge: true });
      })
    );
  }

  updateMenu(meals, commonObj) {
    let batch = this.firestore.firestore.batch();
    meals.forEach((meal: any) => {
      const sampleRef = this.firestore.collection('menu').doc(meal.id)
      batch.update(sampleRef.ref, {...meal});
    })
    const commonObjRef = this.firestore.collection('menu').doc(`${commonObj.restName}Common`);
    batch.update(commonObjRef.ref, {...commonObj});
    return batch.commit().catch(err => console.error(err));
  }

}
