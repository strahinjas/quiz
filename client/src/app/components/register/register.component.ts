import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { AlertService, MyErrorStateMatcher, UserService, ValidateService } from '../../services';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  hide = true;

  fileName: string;
  profilePicture: File;

  registerForm: FormGroup;

  matcher = new MyErrorStateMatcher();

  constructor(
    private formBuilder: FormBuilder,
    private alert: AlertService,
    private userService: UserService,
    private validator: ValidateService,
    private snackBar: MatSnackBar,
    private router: Router) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      name: [null, [Validators.required, this.validator.validateName]],
      surname: [null, [Validators.required, this.validator.validateName]],
      email: [null, [Validators.required, Validators.email]],
      profession: [''],
      role: [null, [Validators.required]],
      username: [null, [Validators.required]],
      password: [null, [Validators.required, this.validator.validatePassword]],
      confirm: [null, [Validators.required, this.validator.validateMatch]],
      gender: ['male'],
      jmbg: [null, [Validators.required, Validators.minLength(13), Validators.maxLength(13), this.validator.validateJMBG]],
      question: [null, [Validators.required]],
      answer: [null, [Validators.required]]
    });
  }

  pictureUpload(event: any) {
    let files = event.target.files;

    if (files.length === 0) {
      this.fileName = '';
      this.profilePicture = null;
    }
    else {
      if (files[0].size > 5 * 1024 * 1024) {
        this.snackBar.open('Maksimalna veličina slike mora biti 5MB.');
      }
      else {
        this.fileName = files[0].name;
        this.profilePicture = files[0];
      }
    }
  }

  convertToFormData(): FormData {
    let formData = new FormData();

    for (const key of Object.keys(this.registerForm.value)) {
      formData.append(key, this.registerForm.value[key]);
    }

    formData.append('picture', this.profilePicture);
    return formData;
  }

  errorMessage(controlName: string): string {
    return this.alert.getMessage(this.registerForm.get(controlName).errors);
  }

  register() {
    this.userService.sendRequest(this.convertToFormData()).subscribe((data: any) => {
      if (data.success) {
        this.snackBar.open(data.message);
        this.router.navigate(['login']);
      }
      else {
        this.snackBar.open(data.message);
        this.router.navigate(['register']);
      }
    });
  }

}
