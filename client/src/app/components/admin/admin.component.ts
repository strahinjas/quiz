import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { User, Anagram, Goblet } from '../../models';
import { MyErrorStateMatcher, UserService, GameService, AlertService } from '../../services';

import * as moment from 'moment';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  admin: User;
  gameForm: FormGroup;

  matcher = new MyErrorStateMatcher();

  requests: User[] = [];

  anagrams: Anagram[];
  goblets: Goblet[];

  dateFilter = (date: Date): boolean => {
    if (moment(date).isBefore(moment(), 'day')) return false;

    return true;
  }

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private gameService: GameService,
    private alert: AlertService) { }

  ngOnInit() {
    this.gameForm = this.formBuilder.group({
      date: [{ value: null, disabled: true }, [Validators.required]],
      anagram: [null, [Validators.required]],
      goblet: [null, [Validators.required]]
    });

    this.userService.getProfile().subscribe((profile: any) => {
      this.admin = profile.user;
      this.userService.loggedUser = this.admin;
    });

    this.loadRequests();
    this.loadGames();
  }

  errorMessage(controlName: string): string {
    return this.alert.getMessage(this.gameForm.get(controlName).errors);
  }

  accept(request: User) {
    this.userService.register(request, true).subscribe((res: any) => {
      this.snackBar.open(res.message);
    });

    let filtered = this.requests.filter((value, index, array) => {
      return value !== request;
    });

    this.requests = filtered;
  }

  reject(request: User) {
    this.userService.register(request, false).subscribe((res: any) => {
      this.snackBar.open(res.message);
    });

    let filtered = this.requests.filter((value, index, array) => {
      return value !== request;
    });

    this.requests = filtered;
  }

  loadRequests() {
    this.userService.getRequests().subscribe((response: any) => {
      this.requests = response.requests;
    });
  }

  loadGames() {
    this.gameService.getAnagrams().subscribe((data: any) => this.anagrams = data.anagrams);
    this.gameService.getGoblets().subscribe((data: any) => this.goblets = data.goblets);
  }

  saveGame() {
    this.gameService.saveGame(
      this.gameForm.controls.date.value,
      this.gameForm.controls.anagram.value,
      this.gameForm.controls.goblet.value).subscribe((data: any) => {
        this.snackBar.open(data.message);
    });
  }

}
