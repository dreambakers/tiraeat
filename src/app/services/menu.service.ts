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
    return this.getCommonObj().pipe(switchMap((commonObject) => {
      return this.fireAuth.authState.pipe(
        switchMap((user) => {
          return this.firestore
          .collection('menu')
          .doc(`${user.email.split('@')[0]}Common`)
          .set({
            ...commonObject,
            ...newData,
            restName: user.email.split('@')[0],
            isCommon: true
          }, { merge: true });
        })
      )
    }))
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

  clearMenu() {
    return this.getMenu().pipe(
      take(1),
      switchMap((meals) => {
        let batch = this.firestore.firestore.batch();
        meals.forEach((meal: any) => {
          const sampleRef = this.firestore.collection('menu').doc(meal.id)
          batch.delete(sampleRef.ref);
        })
        return batch.commit().catch(err => console.error(err));
      })
    );
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

  bulkAdd(meals) {
    const _meals = {};
    // extracting the key, so that we can assign the same index to the new meal obj
    for (let key of Object.keys(meals)) {
      _meals[key] = { ...meals[key], key }
    }
    return this.fireAuth.authState.pipe(
      take(1),
      switchMap((user) => {
        return this.clearMenu().pipe(
          take(1),
          switchMap(() => {
            let batch = this.firestore.firestore.batch();
            Object.values(_meals).forEach((meal: any) => {
              const restName = user.email.split('@')[0];
              const index = meal['key'].split(meal.restName)[1]; delete meal['key'];
              const mealId = meal.isCommon ? `${restName}Common`: (`${restName}${index}`);
              meal['restName'] = restName;
              for(let key of Object.keys(meal)) {
                if (key.startsWith('_')) {
                  delete meal[key];
                }
              }
              if (meal.id) {
                delete meal.id;
              }
              if (meal.positionByCat) {
                const mealPost = meal.positionByCat.split(meal.mealCat)[1];
                meal.positionByCat = parseInt(mealPost, 10);
              }

              const sampleRef = this.firestore.collection('menu').doc(mealId);
              batch.set(sampleRef.ref, meal);
            })
            return batch.commit().catch(err => console.error(err));
          }
        ))
      }))
  }
}
