import { Injectable } from '@angular/core';
import { ValidationErrors, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  getMessage(errors: ValidationErrors): string {
    const errorCode = (errors && Object.keys(errors).length) ? Object.keys(errors)[0] : '';
    
    switch (errorCode) {
      case 'required':
        return 'Ovo polje je obavezno';
      case 'email':
        return 'Unesite ispravnu adresu';
      case 'validName':
        return 'Ime i prezime mora početi velikim slovom';
      case 'validPassword':
        return 'Unesite ispravnu lozinku';
      case 'validMatch':
        return 'Lozinke se ne poklapaju';
      case 'minlength':
      case 'maxlength':
        return 'JMBG mora sadržati tačno 13 cifara';
      case 'validJMBG':
        return 'Unesite ispravan JMBG';
      default:
        return errorCode;
    }
  }

}
