import { Pipe, PipeTransform } from '@angular/core';
import { constants } from '../app.constants';

@Pipe({
  name: 'englishToHebrew'
})
export class EnglishToHebrewPipe implements PipeTransform {

  transform(value: string): string {
    var english = /^[A-Za-z0-9]*$/;
    let converted = value;

    // __ is a unique identifier used to indicate that the key is converted from hewbrew
    // to english using the provided map
    if (value && value.startsWith('__') && english.test(value.substring(2))) {
      converted = '';
      const englishToHebrewAlphabet = this.objectFlip(constants.hebrewToEnglishAlphabet);
      for (let character of value.substring(2)) {
        converted += englishToHebrewAlphabet[character] || '';
      }
    }
    return converted;
  }

  objectFlip(obj) {
    const ret = {};
    Object.keys(obj).forEach(key => {
      ret[obj[key]] = key;
    });
    return ret;
  }

}
