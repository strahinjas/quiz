import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { evaluate } from 'mathjs';

import { UserService, GameService, RealTimeService } from '../../services';

const DOUBLES: number[] = [10, 15, 20];
const TRIPLES: number[] = [25, 50, 75, 100];

@Component({
  selector: 'app-my-number',
  templateUrl: './my-number.component.html',
  styleUrls: ['./my-number.component.css']
})
export class MyNumberComponent implements OnInit, OnDestroy {
  single: boolean;
  isBlue: boolean;
  locked: boolean;
  myTurn: boolean;
  waiting = false;
  operation = false;

  subscription: Subscription;

  numbers = [1, 1, 1, 1, DOUBLES[0], TRIPLES[0]];
  numberUsed: boolean[];

  target = 1;

  interval; timeout;
  loopInterval;

  round = 0;
  timeLeft = 60;

  redResult: number;
  totalBluePoints = 0;
  totalRedPoints = 0;

  numberForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private gameService: GameService,
    private snackBar: MatSnackBar,
    private realTime: RealTimeService) { }

  ngOnInit() {
    this.numberForm = this.formBuilder.group({
      expression: [{ value: '', disabled: true }]
    });

    this.single = this.route.snapshot.paramMap.get('mode') === 'singleplayer';

    if (this.single) {
      this.myTurn = true;
      this.startLoop();
    }
    else {
      this.isBlue = this.userService.loggedUser.username === this.gameService.activeMatch.blue;

      if (this.isBlue) {
        this.myTurn = true;
        this.startLoop();
        this.getRedResult();
      }
      else {
        this.myTurn = false;
        this.startLoop();
        this.subscription = this.realTime.getNumbers().subscribe((data: any) => {
          this.stopLoop();
          this.target = data.target;
          this.numbers = data.numbers;
        });
      }
    }
  }

  get form() { return this.numberForm.controls; }

  ngOnDestroy() {
    this.stopTimer();
    clearTimeout(this.timeout);
    clearInterval(this.loopInterval);
    this.unsubscribe();
  }

  unsubscribe() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  getRedResult() {
    this.unsubscribe();
    this.subscription = this.realTime.getRedResult().subscribe((redResult: number) => {
      this.redResult = redResult;
      if (this.waiting) this.checkResult();
    });
  }

  startLoop() {
    this.locked = true;
    this.numberUsed = new Array(6).fill(false);

    this.loopInterval = setInterval(() => {
      this.target = Math.ceil(Math.random() * 999);

      this.numbers[0] = Math.ceil(Math.random() * 9);
      this.numbers[1] = Math.ceil(Math.random() * 9);
      this.numbers[2] = Math.ceil(Math.random() * 9);
      this.numbers[3] = Math.ceil(Math.random() * 9);

      this.numbers[4] = DOUBLES[Math.floor(Math.random() * DOUBLES.length)];

      this.numbers[5] = TRIPLES[Math.floor(Math.random() * TRIPLES.length)];
    }, 50);
  }

  stopLoop() {
    clearInterval(this.loopInterval);

    let data = {
      target: this.target,
      numbers: this.numbers
    };

    if ((this.isBlue && this.round === 0) || (!this.isBlue && this.round === 1)) {
      this.realTime.sendNumbers(data);
    }

    this.locked = false;
    this.startTimer();
  }

  startTimer() {
    this.timeLeft = 60;
    this.interval = setInterval(() => {
      if (--this.timeLeft === 0) {
        this.checkResult();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.interval);
  }

  append(symbol: string) {
    if (symbol[0] >= '0' && symbol[0] <= '9') this.operation = true;
    else this.operation = false;
    this.form.expression.setValue(this.form.expression.value + symbol);
  }

  backspace() {
    let expression: string = this.form.expression.value;
    let index = expression.length - 1;

    if (expression[index] >= '0' && expression[index] <= '9') {
      while (index >= 0 && /\d/.test(expression[index]))--index;

      let value = parseInt(expression.slice(++index));
      for (let i = 0; i < this.numbers.length; i++) {
        if (this.numberUsed[i] && this.numbers[i] === value) {
          this.numberUsed[i] = false;
          break;
        }
      }
      this.operation = false;
    }

    this.form.expression.setValue(expression.slice(0, index));
  }

  calculate(expression: string) {
    try {
      let result: number = evaluate(expression);
      return result.toString();
    }
    catch (e) {
      return '???';
    }
  }

  finish() {
    let match = this.gameService.activeMatch;

    match.bluePoints += this.totalBluePoints;
    match.bluePointsPerGame.push(this.totalBluePoints);
    match.redPoints += this.totalRedPoints;
    match.redPointsPerGame.push(this.totalRedPoints);

    this.gameService.activeMatch = match;
    this.gameService.updateMatch().subscribe();
    this.snackBar.open(`Plavi takmičar: ${this.totalBluePoints} | Crveni takmičar: ${this.totalRedPoints}`);

    this.timeout = setTimeout(() => {
      this.router.navigate(['hangman', 'multiplayer']);
    }, 2000);
  }

  checkResult() {
    this.stopTimer();

    if (this.single) {
      let result = parseInt(this.calculate(this.form.expression.value));
      let game = this.gameService.todayGame;

      if (result === this.target) {
        game.points += 10;
        game.pointsPerGame.push(10);
        this.snackBar.open('Osvojili ste 10 poena.');
      }
      else {
        game.pointsPerGame.push(0);
        this.snackBar.open('Niste osvojili nijedan poen.');
      }
      this.gameService.todayGame = game;
      this.gameService.updateGame().subscribe();

      this.timeout = setTimeout(() => {
        this.router.navigate(['hangman', 'singleplayer']);
      }, 2000);
    }
    else {
      let result = parseInt(this.calculate(this.form.expression.value));

      if (this.isBlue) {
        if (this.redResult === undefined) this.waiting = true;
        else {
          let points = {
            bluePoints: 0,
            redPoints: 0
          };

          if (!result && this.redResult) points.redPoints = 10;
          else if (result && !this.redResult) points.bluePoints = 10;
          else if (result && this.redResult) {
            let diffBlue = Math.abs(this.target - result);
            let diffRed = Math.abs(this.target - this.redResult);
    
            if (diffBlue === diffRed) points.bluePoints = points.redPoints = 5;
            else if (diffBlue < diffRed) points.bluePoints = 10;
            else points.redPoints = 10;
          }

          this.totalBluePoints += points.bluePoints;
          this.totalRedPoints += points.redPoints;
          this.realTime.sendPoints(points);
    
          if (this.round === 1) this.finish();
          else {
            this.round++;
            this.form.expression.setValue('');
            this.operation = false;
            this.myTurn = false;
            this.redResult = undefined;
            this.waiting = false;
            this.startLoop();
            this.unsubscribe();
            this.subscription = this.realTime.getNumbers().subscribe((data: any) => {
              this.stopLoop();
              this.target = data.target;
              this.numbers = data.numbers;
              this.getRedResult();
            });
          }
        }
      }
      else {
        this.unsubscribe();
        this.realTime.sendRedResult(result);
        this.subscription = this.realTime.getPoints().subscribe((roundPoints: any) => {
          this.totalBluePoints += roundPoints.bluePoints;
          this.totalRedPoints += roundPoints.redPoints;

          if (this.round === 1) this.finish();
          else {
            this.round++;
            this.form.expression.setValue('');
            this.operation = false;
            this.myTurn = true;
            this.startLoop();
          }
        });
      }
    }
  }

}
