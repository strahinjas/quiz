import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { Goblet } from '../../models';
import { UserService, GameService, RealTimeService } from '../../services';

@Component({
  selector: 'app-goblet',
  templateUrl: './goblet.component.html',
  styleUrls: ['./goblet.component.css']
})
export class GobletComponent implements OnInit, OnDestroy {
  single: boolean;
  isBlue: boolean;
  spectator: boolean;

  subscription: Subscription;

  round = 0;
  question = 0;
  attempts: number[];

  points = 0;
  bluePoints = 0;
  redPoints = 0;

  timer; timeout;
  timeLeft = 30;

  rows: any[];
  goblets: Goblet[] = [];

  gobletForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private gameService: GameService,
    private realTime: RealTimeService) { }

  ngOnInit() {
    this.gobletForm = this.formBuilder.group({
      answer: [null, [Validators.required]]
    });

    this.single = this.route.snapshot.paramMap.get('mode') === 'singleplayer';

    if (this.single) {
      this.gameService.getGoblet().subscribe((data: any) => {
        this.goblets[this.round] = data.goblet;
        this.splitGoblet(this.goblets[this.round]);
        this.startTimer();
      });
    }
    else {
      this.isBlue = this.userService.loggedUser.username === this.gameService.activeMatch.blue;

      if (this.isBlue) {
        this.gameService.getGobletPair().subscribe((data: any) => {
          this.goblets = data.pair;
          this.realTime.sendGoblets(this.goblets);
          this.splitGoblet(this.goblets[this.round]);

          this.spectator = false;
          this.startTimer();
        });
      }
      else {
        this.subscription = this.realTime.getGoblets().subscribe((data: Goblet[]) => {
          this.goblets = data;
          this.splitGoblet(this.goblets[this.round]);

          this.spectator = true;
          this.answer.disable();
          this.answer.setValue('PROTIVNIK JE NA POTEZU');
          this.startTimer();
          this.watch();
        });
      }
    }
  }

  ngOnDestroy() {
    this.stopTimer();
    clearTimeout(this.timeout);
    this.unsubscribe();
  }

  get row() { return this.goblets[this.round].rows[this.question]; }
  get answer() { return this.gobletForm.get('answer'); }

  unsubscribe() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  updateValidators() {
    this.gobletForm.get('answer').setValidators([
      Validators.required,
      Validators.minLength(this.row.answer.length),
      Validators.maxLength(this.row.answer.length)
    ]);
    this.gobletForm.get('answer').updateValueAndValidity();
  }

  splitWord(word: string): any[] {
    let result = [];

    for (let i = 0; i < word.length; i++) {
      if (i + 1 < word.length &&
        (((word[i] === 'l' || word[i] === 'n') && word[i + 1] === 'j') ||
          (word[i] === 'd' && word[i + 1] === 'ž'))) {
        result.push({
          letter: word[i].toUpperCase() + word[++i],
          blue: false,
          red: false,
          missed: false
        });
      }
      else result.push({
        letter: word[i].toUpperCase(),
        blue: false,
        red: false,
        missed: false
      });
    }

    return result;
  }

  splitGoblet(goblet: Goblet) {
    this.rows = [];

    for (let row of goblet.rows) {
      this.rows.push(this.splitWord(row.answer));
    }

    this.question = 0;
    this.attempts = new Array(13).fill(0);
    this.updateValidators();
  }

  startTimer() {
    this.timeLeft = 30;
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) --this.timeLeft;

      if (this.timeLeft === 0 && !this.spectator) {
        this.checkAnswer(this.gobletForm.get('answer').value);
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timer);
  }

  watch() {
    this.unsubscribe();
    this.subscription = this.realTime.getAnswer().subscribe((answer: string) => this.checkAnswer(answer));
  }

  switch() {
    if (this.spectator) {
      this.unsubscribe();
      this.spectator = false;
      this.answer.reset();
      this.answer.enable();
      this.startTimer();
    }
    else {
      this.spectator = true;
      this.answer.disable();
      this.answer.setValue('PROTIVNIK JE NA POTEZU');
      this.watch();
      this.startTimer();
    }
  }

  checkAnswer(answer: string) {
    this.stopTimer();
    if (!answer) answer = '';

    if (this.single) {
      this.answer.reset();

      if (answer.toLowerCase() === this.row.answer) {
        this.points += 2;
        for (let letter of this.rows[this.question]) letter.blue = true;
      }
      else {
        for (let letter of this.rows[this.question]) letter.missed = true;
      }
      if (this.question === this.goblets[this.round].rows.length - 1) this.finish();
      else {
        this.question++;
        this.updateValidators();
        this.startTimer();
      }
    }
    else {
      this.attempts[this.question]++;

      if (!this.spectator) {
        this.realTime.sendAnswer(answer);
        this.answer.reset();
      }

      if (answer.toLowerCase() === this.row.answer) {
        if ((this.isBlue && this.spectator) || (!this.isBlue && !this.spectator)) {
          this.redPoints += 2;
          for (let letter of this.rows[this.question]) letter.red = true;
        }
        else {
          this.bluePoints += 2;
          for (let letter of this.rows[this.question]) letter.blue = true;
        }

        if (this.question === this.goblets[this.round].rows.length - 1) {
          if (this.spectator) this.unsubscribe();
          this.finish();
        }
        else {
          this.question++;
          this.updateValidators();
          this.startTimer();
        }
      }
      else if (this.attempts[this.question] === 2) {
        for (let letter of this.rows[this.question]) letter.missed = true;

        if (this.question === this.goblets[this.round].rows.length - 1) {
          if (this.spectator) this.unsubscribe();
          this.finish();
        }
        else {
          this.question++;
          this.updateValidators();

          this.switch();
        }
      }
      else this.switch();
    }
  }

  skip() {
    this.stopTimer();

    if (this.single) {
      this.answer.reset();
      for (let letter of this.rows[this.question]) letter.missed = true;

      if (this.question === this.goblets[this.round].rows.length - 1) this.finish();
      else {
        this.question++;
        this.updateValidators();
        this.startTimer();
      }
    }
    else {
      this.answer.reset();
      this.realTime.sendAnswer('');
      this.attempts[this.question]++;

      if (this.attempts[this.question] === 2) {
        for (let letter of this.rows[this.question]) letter.missed = true;

        if (this.question === this.goblets[this.round].rows.length - 1) this.finish();
        else {
          this.question++;
          this.updateValidators();

          this.switch();
        }
      }
      else this.switch();
    }
  }

  finish() {
    if (this.single) {
      let game = this.gameService.todayGame;
      game.points += this.points;
      game.pointsPerGame.push(this.points);
      this.gameService.todayGame = game;
      this.gameService.updateGame().subscribe();

      this.snackBar.open(`Osvojili ste ${this.points} poena.`);
      this.timeout = setTimeout(() => {
        this.router.navigate(['result', 'singleplayer']);
      }, 2000);
    }
    else {
      if (this.round === 1) {
        let match = this.gameService.activeMatch;

        match.bluePoints += this.bluePoints;
        match.bluePointsPerGame.push(this.bluePoints);
        match.redPoints += this.redPoints;
        match.redPointsPerGame.push(this.redPoints);

        this.gameService.activeMatch = match;
        this.gameService.updateMatch().subscribe();
        this.snackBar.open(`Plavi takmičar: ${this.bluePoints} | Crveni takmičar: ${this.redPoints}`);

        this.timeout = setTimeout(() => {
          this.router.navigate(['result', 'multiplayer']);
        }, 2000);
      }
      else {
        this.timeout = setTimeout(() => {
          this.round++;
          this.splitGoblet(this.goblets[this.round]);

          if (this.isBlue) {
            this.spectator = true;
            this.answer.disable();
            this.answer.setValue('PROTIVNIK JE NA POTEZU');
            this.watch();
          }
          else {
            this.spectator = false;
            this.unsubscribe();
            this.answer.reset();
            this.answer.enable();
          }

          this.startTimer();
        }, 1000);
      }
    }
  }

}
