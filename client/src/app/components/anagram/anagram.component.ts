import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { Anagram } from '../../models';
import { UserService, GameService, RealTimeService } from '../../services';

@Component({
  selector: 'app-anagram',
  templateUrl: './anagram.component.html',
  styleUrls: ['./anagram.component.css']
})
export class AnagramComponent implements OnInit, OnDestroy {
  anagrams: Anagram[] = [];
  subscription: Subscription;

  interval; timeout;
  round = 0;
  timeLeft = 60;

  single: boolean;
  isBlue: boolean;
  waiting = false;
  correct = [false, false];
  opponent: boolean[];

  anagramForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private gameService: GameService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private realTime: RealTimeService) { }

  get form() { return this.anagramForm.controls; }

  ngOnInit() {
    this.anagramForm = this.formBuilder.group({
      answer: [null]
    });

    this.single = this.route.snapshot.paramMap.get('mode') === 'singleplayer';

    if (this.single) {
      this.gameService.getAnagram().subscribe((data: any) => {
        this.anagrams.push(data.anagram);
        this.startTimer();
      });
    }
    else {
      this.isBlue = this.userService.loggedUser.username === this.gameService.activeMatch.blue;

      if (this.isBlue) {
        this.gameService.getAnagramPair().subscribe((data: any) => {
          this.anagrams = data.pair;
          this.realTime.sendAnagrams(this.anagrams);
          this.startTimer();
          this.getOpponent();
        });
      }
      else {
        this.subscription = this.realTime.getAnagrams().subscribe(data => {
          this.anagrams = data as Anagram[];
          this.startTimer();
          this.getOpponent();
        });
      }
    }
  }

  ngOnDestroy() {
    this.stopTimer();
    clearTimeout(this.timeout);
    this.unsubscribe();
  }

  startTimer() {
    this.interval = setInterval(() => {
      if (--this.timeLeft === 0) {
        this.checkAnswer();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.interval);
  }

  unsubscribe() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  getOpponent() {
    this.unsubscribe();
    this.subscription = this.realTime.getSolutions(this.isBlue).subscribe((data: boolean[]) => {
      this.opponent = data;
      if (this.waiting) {
        this.calculatePoints();

        this.timeout = setTimeout(() => {
          this.router.navigate(['my-number', 'multiplayer']);
        }, 2000);
      }
    });
  }

  calculatePoints() {
    let match = this.gameService.activeMatch;
    let bluePoints = 0;
    let redPoints = 0;

    for (let i = 0; i < 2; i++) {
      if (this.correct[i] && this.opponent[i]) {
        bluePoints += 5;
        redPoints += 5;
      }
      else if (this.correct[i]) {
        if (this.isBlue) bluePoints += 10;
        else redPoints += 10;
      }
      else if (this.opponent[i]) {
        if (!this.isBlue) bluePoints += 10;
        else redPoints += 10;
      }
    }

    match.bluePoints += bluePoints;
    match.bluePointsPerGame.push(bluePoints);
    match.redPoints += redPoints;
    match.redPointsPerGame.push(redPoints);

    this.gameService.activeMatch = match;
    this.gameService.updateMatch().subscribe();

    this.snackBar.open(`Plavi takmičar: ${bluePoints} | Crveni takmičar: ${redPoints}`);
  }

  checkAnswer() {
    this.stopTimer();

    let answer = this.form.answer.value ? this.form.answer.value.toLowerCase() : '';
    let solution = this.anagrams[this.round].solution.toLowerCase();

    if (this.single) {
      let game = this.gameService.todayGame;

      if (answer === solution) {
        game.points += 10;
        game.pointsPerGame.push(10);
        this.snackBar.open('Tačan odgovor! Osvojili ste 10 poena.');
      }
      else {
        game.pointsPerGame.push(0);
        this.snackBar.open(`Netačan odgovor! Rešenje: ${this.anagrams[this.round].solution}`);
      }
      this.gameService.todayGame = game;
      this.gameService.updateGame().subscribe();

      this.timeout = setTimeout(() => {
        this.router.navigate(['my-number', 'singleplayer']);
      }, 2000);
    }
    else {
      if (answer === solution) this.correct[this.round] = true;
      if (this.round === 1) {
        if (!this.waiting) {
          this.realTime.sendSolutions(this.isBlue, this.correct);
          if (this.opponent) {
            this.calculatePoints();

            this.timeout = setTimeout(() => {
              this.router.navigate(['my-number', 'multiplayer']);
            }, 2000);
          }
          else this.waiting = true;
        }
      }
      else {
        this.round++;
        this.form.answer.reset();
        this.timeLeft = 60;
        this.startTimer();
      }
    }
  }

}
