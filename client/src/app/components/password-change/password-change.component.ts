import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MyErrorStateMatcher, ValidateService, UserService, AlertService } from '../../services';

@Component({
  selector: 'app-password-change',
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.css']
})
export class PasswordChangeComponent implements OnInit {
  hideOld: boolean = true;
  hideNew: boolean = true;

  forgotten: boolean;

  passwordForm: FormGroup;

  matcher = new MyErrorStateMatcher();

  constructor(
    private formBuilder: FormBuilder,
    private validator: ValidateService,
    private route: ActivatedRoute,
    private router: Router,
    private alert: AlertService,
    private userService: UserService,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.passwordForm = this.formBuilder.group({
      username: [null, [Validators.required]],
      oldPassword: [null, [Validators.required]],
      password: [null, [Validators.required, this.validator.validatePassword]],
      confirm: [null, [this.validator.validateMatch]]
    });

    this.forgotten = this.route.snapshot.paramMap.get('variant') === 'forgotten';

    if (this.forgotten) {
      const oldPassword = this.passwordForm.get('oldPassword');
      oldPassword.setValidators(null);
      oldPassword.updateValueAndValidity();
    }
  }

  errorMessage(controlName: string): string {
    return this.alert.getMessage(this.passwordForm.get(controlName).errors);
  }

  changePassword(): void {
    const username = this.passwordForm.get('username').value;
    const password = this.passwordForm.get('password').value;

    let data;

    if (this.forgotten) {
      data = { username, password };
    }
    else {
      const oldPassword = this.passwordForm.get('oldPassword').value;
      data = { username, oldPassword, password };
    }

    this.userService.changePassword(data).subscribe((res: any) => {
      if (res.success) {
        this.snackBar.open(res.message);

        let user = this.userService.loggedUser;
        if (user) this.router.navigate([user.role]);
        else this.router.navigate(['login']);
      }
      else {
        this.snackBar.open(res.message);
        if (this.forgotten)
          this.router.navigate(['password-change/forgotten']);
        else
          this.router.navigate(['password-change/voluntarily']);
      }
    });
  }

}
