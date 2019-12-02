import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MyErrorStateMatcher, UserService, AlertService } from '../../services';

@Component({
  selector: 'app-secret-question',
  templateUrl: './secret-question.component.html',
  styleUrls: ['./secret-question.component.css']
})
export class SecretQuestionComponent implements OnInit {
  question: string;
  username: string;

  questionForm : FormGroup;

  matcher = new MyErrorStateMatcher();

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private alert: AlertService,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.questionForm = this.formBuilder.group({
      answer: [null, [Validators.required]]
    });

    this.username = localStorage.getItem('username');
    const jmbg = localStorage.getItem('jmbg');

    localStorage.removeItem('username');
    localStorage.removeItem('jmbg');

    this.userService.getSecretQuestion(this.username, jmbg).subscribe((data: any) => {
      if (data.success) {
        this.question = data.question;

        this.snackBar.open(data.message);
      }
      else {
        this.snackBar.open(data.message);
        this.router.navigate(['login']);
      }
    });
  }

  get form() { return this.questionForm.controls; }

  errorMessage(controlName: string): string {
    return this.alert.getMessage(this.questionForm.get(controlName).errors);
  }

  checkAnswer() {
    this.userService.checkAnswer(this.username, this.form.answer.value).subscribe((data: any) => {
      if (data.success) {
        this.snackBar.open(data.message);
        this.router.navigate(['password-change', 'forgotten']);
      }
      else {
        this.snackBar.open(data.message);
        this.router.navigate(['']);
      }
    });
  }

}
