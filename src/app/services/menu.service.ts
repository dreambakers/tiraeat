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
              const mealId = (`${user.email.split('@')[0]}${meals.length}`)
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
              res => ({...res.data() as {}, id: res.id})
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
        .set({
          ...newData,
          restName: user.email.split('@')[0],
          isCommon: true
        }, { merge: true });
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

  updateCategory(meals, commonObj, updatedCat) {
    let batch = this.firestore.firestore.batch();
    meals?.forEach((meal: any) => {
      const sampleRef = this.firestore.collection('menu').doc(meal.id)
      batch.update(sampleRef.ref, {...meal, mealCat: updatedCat });
    })
    const commonObjRef = this.firestore.collection('menu').doc(`${commonObj.restName}Common`);
    batch.update(commonObjRef.ref, {...commonObj});
    return batch.commit().catch(err => console.error(err));
  }

  deleteCategory(category, commonObj) {

    console.log(commonObj)
    let batch = this.firestore.firestore.batch();
    category?.meals?.forEach((meal: any) => {
      const mealRef = this.firestore.collection('menu').doc(meal.id)
      batch.delete(mealRef.ref);
    })
    const commonObjRef = this.firestore.collection('menu').doc(commonObj.id);
    batch.update(commonObjRef.ref, {
      ...commonObj,
      mealsCategoriesOrder: commonObj.mealsCategoriesOrder.filter(cat => cat !== category.name)
    });
    return batch.commit().catch(err => console.error(err));
  }

  deleteMeal(meal) {
    return this.firestore
      .collection('menu')
      .doc(meal.id)
      .delete();
  }

  editMeal(updatedMeal) {
    return this.firestore
    .collection('menu')
    .doc(updatedMeal.id)
    .set({
      ...updatedMeal
    }, { merge: true }).then(
      res => {
        return updatedMeal;
      }
    )
  }
}
