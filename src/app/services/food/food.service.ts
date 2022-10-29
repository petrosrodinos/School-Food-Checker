import { DateService } from './../date/date.service';
import { FireserviceService } from '../auth/fireservice.service';
import { Injectable } from '@angular/core';
import { Food } from 'src/app/types/food';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root',
})
export class FoodService {
  imagePath: string;
  user: any;
  constructor(
    private firestore: AngularFirestore,
    private fireservice: FireserviceService,
    private dateService: DateService,
    private fireStorage: AngularFireStorage
  ) {}

  public async addFood(food: Food): Promise<any> {
    this.user = this.fireservice.getUser();
    if (this.user) {
      if (food.photo) {
        return this.uploadPhoto(food).then((res) => {
          return this.addFoodFinal(food, res);
        });
      } else {
        return this.addFoodFinal(food);
      }
    }
  }

  public addFoodFinal(food: Food, photo = ''): Promise<any> {
    const foodId = this.firestore.createId();
    const foodWithUser = {
      ...food,
      id: foodId,
      photo,
      userId: this.user.uid,
      date: this.dateService.formatDate(new Date()),
      time: this.dateService.formatTime(new Date()),
    };
    return this.firestore.collection('food').doc(foodId).set(foodWithUser);
  }

  public getFoods(): any {
    return this.firestore
      .collection('food', (ref) =>
        ref
          .where('date', '==', this.dateService.formatDate(new Date()))
          .orderBy('time', 'desc')
      )
      .valueChanges();
  }

  public deleteFood(id: string): Promise<any> {
    return this.firestore.collection('food').doc(id).delete();
  }

  public async uploadPhoto(food: Food): Promise<string> {
    return this.fireStorage
      .upload(
        `meals/${new Date().toDateString().split(' ').concat('-')}_${
          food.firstplate
        }-${food.secondplate}`,
        food.photo.blob
      )
      .snapshotChanges()
      .toPromise()
      .then((res) => {
        return res.ref.getDownloadURL() as Promise<string>;
      });
  }
}
