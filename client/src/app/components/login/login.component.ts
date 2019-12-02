import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MyErrorStateMatcher, UserService, AlertService } from '../../services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  hide: boolean = true;

  loginForm: FormGroup;

  matcher = new MyErrorStateMatcher();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alert: AlertService,
    private userService: UserService,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]],
      jmbg: [null],
      toggle: [null]
    });
  }

  login() {
    this.userService.authenticate(this.loginForm.value).subscribe((data: any) => {
      if (data.success) {
        this.userService.token = data.token;
        this.snackBar.open('Uspešno ste se prijavili.');
        this.router.navigate([`${data.role}`]);
      }
      else {
        this.snackBar.open(data.message);
        this.router.navigate(['login']);
      }
    });
  }

  errorMessage(controlName: string): string {
    return this.alert.getMessage(this.loginForm.get(controlName).errors);
  }

  updateValidators() {
    const password = this.loginForm.get('password');
    const jmbg = this.loginForm.get('jmbg');

    if (this.loginForm.get('toggle').value) {
      password.setValidators(null);
      jmbg.setValidators([Validators.required, Validators.minLength(13), Validators.maxLength(13)]);

      this.snackBar.open('Umesto lozinke unesite Vaš JMBG.');
    }
    else {
      jmbg.setValidators(null);
      password.setValidators([Validators.required]);
    }

    password.updateValueAndValidity();
    jmbg.updateValueAndValidity();
  }

  passwordChange() {
    const username = this.loginForm.get('username').value;
    const jmbg     = this.loginForm.get('jmbg').value;

    localStorage.setItem('username', username);
    localStorage.setItem('jmbg', jmbg);

    this.router.navigate(['question']);
  }

}
