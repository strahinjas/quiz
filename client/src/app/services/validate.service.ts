import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidateService {

  constructor() { }

  validateName(control: AbstractControl): { [key: string]: boolean } | null {
    return /^[A-Z\u0100-\u017F][a-z\u0100-\u017F]+$/.test(control.value) ? null : { validName: true };
  }

  validatePassword(control: AbstractControl): { [key: string]: boolean } | null {
    return /^(?=.{8,12}$)(?!.*(\S)\1{2})(?=.*[A-Z])(?=.*[a-z]{3})(?=.*\d)(?=.*[^a-zA-Z0-9])([a-zA-Z]\S*)$/
      .test(control.value) ? null : { validPassword: true };
  }

  validateMatch(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.parent === undefined) return null;
    
    const password = control.parent.get('password').value;
    const confirmation = control.value;
    
    return password === confirmation ? null : { validMatch: true };
  }

  validateJMBG(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.parent === undefined) return null;

    const regex = /^\d{13}$/;
    const jmbg = control.value;

    let valid = false;

    if (regex.test(jmbg)) {
      const day = parseInt(jmbg.slice(0, 2));

      if (day > 0 && day < 32) {
        const month = parseInt(jmbg.slice(2, 4));

        if (month > 0 && month < 13) {
          const year = parseInt(jmbg.slice(4, 7));

          if ((year > 0 && year < 19) || year > 900) {
            const n = parseInt(jmbg.charAt(9));
            const gender = control.parent.get('gender').value;

            if ((n < 5 && gender === 'male') || (n > 4 && gender === 'female')) {
              const coefs = [7, 6, 5, 4, 3, 2];
              const digits = jmbg.split('').map((c: string) => parseInt(c));

              let m = 0;

              for (let i = 0; i < 12; i++)
                m += coefs[i % 6] * digits[i];

              m %= 11;
              
              if ((m === 0 && m === digits[12]) || (m > 1 && m === 11 - digits[12]))
                valid = true;
            }
          }
        }
      }
    }
    
    return valid ? null : { validJMBG: true };
  }

  validateTerm(letter: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control.value && control.value !== '' && !control.value.toUpperCase().startsWith(letter.toUpperCase())) {
        return { validTerm: true };
      }
      return null;
    }
  }

}
