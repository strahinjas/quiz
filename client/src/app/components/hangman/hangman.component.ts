import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { Hangman } from '../../models';
import { UserService, GameService, RealTimeService } from '../../services';

@Component({
  selector: 'app-hangman',
  templateUrl: './hangman.component.html',
  styleUrls: ['./hangman.component.css']
})
export class HangmanComponent implements OnInit, OnDestroy {
  alphabet = [
    'A', 'B', 'C', 'Č', 'Ć', 'D', 'Dž', 'Đ', 'E', 'F',
    'G', 'H', 'I', 'J', 'K', 'L', 'Lj', 'M', 'N', 'Nj',
    'O', 'P', 'R', 'S', 'Š', 'T', 'U', 'V', 'Z', 'Ž'
  ];
  chosen = new Array(30).fill(false);

  single: boolean;
  isBlue: boolean;
  spectator: boolean;

  subscription: Subscription;

  round = 0;
  errors = 0;
  opened = 0;

  points = 0;
  bluePoints = 0;
  redPoints = 0;

  word = [];
  hangmen: Hangman[];

  interval; timeout;
  imageURL: string = '../../../assets/images/gallows.png';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private gameService: GameService,
    private realTime: RealTimeService) { }

  ngOnInit() {
    this.single = this.route.snapshot.paramMap.get('mode') === 'singleplayer';

    if (this.single) {
      this.gameService.getHangmanPair().subscribe((data: any) => {
        this.hangmen = data.pair;
        this.splitWord(this.hangmen[this.round].word);
      });
    }
    else {
      this.isBlue = this.userService.loggedUser.username === this.gameService.activeMatch.blue;

      if (this.isBlue) {
        this.gameService.getHangmanPair().subscribe((data: any) => {
          this.hangmen = data.pair;
          this.realTime.sendHangmen(this.hangmen);
          this.splitWord(this.hangmen[this.round].word);

          this.spectator = false;
        });
      }
      else {
        this.subscription = this.realTime.getHangmen().subscribe((data: Hangman[]) => {
          this.hangmen = data;
          this.splitWord(this.hangmen[this.round].word);
          
          this.spectator = true;
          this.watch();
        });
      }
    }
  }

  ngOnDestroy() {
    clearTimeout(this.timeout);
    this.stop();
  }

  unsubscribe() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  splitWord(databaseWord: string) {
    this.word = [];

    for (let i = 0; i < databaseWord.length; i++) {
      if (i + 1 < databaseWord.length &&
        (((databaseWord[i] === 'l' || databaseWord[i] === 'n') && databaseWord[i + 1] === 'j') ||
          (databaseWord[i] === 'd' && databaseWord[i + 1] === 'ž'))) {
        this.word.push({
          letter: databaseWord[i].toUpperCase() + databaseWord[++i],
          blue: false,
          red: false,
          missed: false
        });
      }
      else this.word.push({
        letter: databaseWord[i].toUpperCase(),
        blue: false,
        red: false,
        missed: false
      });
    }
  }

  watch() {
    this.interval = setInterval(() => {
      this.unsubscribe();
      this.subscription = this.realTime.getSelectedLetter().subscribe((letter: string) => {
        this.check(letter);
      });
    }, 200);
  }

  stop() {
    clearInterval(this.interval);
    this.unsubscribe();
  }

  check(choice: string) {
    if (!this.single && !this.spectator) this.realTime.sendSelectedLetter(choice);

    this.chosen[this.alphabet.indexOf(choice)] = true;

    let exists = false;

    for (let letter of this.word) {
      if (choice === letter.letter) {
        if (this.single || (this.isBlue && !this.spectator) || (!this.isBlue && this.spectator)) letter.blue = true;
        else letter.red = true;

        this.opened++;
        exists = true;

        if (this.single) this.points++;
        else if ((this.isBlue && this.spectator) || (!this.isBlue && !this.spectator)) this.redPoints++;
        else this.bluePoints++;
      }
    }

    if (!exists) {
      this.snackBar.open('Pogrešno slovo!');
      switch (++this.errors) {
        case 1: {
          this.imageURL = '../../../assets/images/head.png';
          break;
        }
        case 2: {
          this.imageURL = '../../../assets/images/body.png';
          break;
        }
        case 3: {
          this.imageURL = '../../../assets/images/arms.png';
          break;
        }
        case 4: {
          this.imageURL = '../../../assets/images/legs.png';
          if (this.single) this.finish();
          else {
            if (this.spectator) {
              this.spectator = false;
              this.stop();
            }
            else {
              this.spectator = true;
              this.watch();
            }
          }
          break;
        }
        case 5: {
          if (this.spectator) this.stop();
          this.finish();
          break;
        }
      }
    }

    if (this.opened === this.word.length) {
      if (this.spectator) this.stop();

      if (this.single) this.points += 2;
      else if ((this.isBlue && this.spectator) || (!this.isBlue && !this.spectator)) this.redPoints += 2;
      else this.bluePoints += 2;
      this.finish();
    }
  }

  finish() {
    for (let letter of this.word) {
      if (!letter.blue && !letter.red) letter.missed = true;
    }

    if (this.single) {
      let game = this.gameService.todayGame;
      game.points += this.points;
      game.pointsPerGame.push(this.points);
      this.gameService.todayGame = game;
      this.gameService.updateGame().subscribe();
      this.snackBar.open(`Osvojili ste ${this.points} poena.`);

      this.timeout = setTimeout(() => {
        this.router.navigate(['geography', 'singleplayer']);
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
          this.router.navigate(['geography', 'multiplayer']);
        }, 2000);
      }
      else {
        this.timeout = setTimeout(() => {
          this.round++;
          this.splitWord(this.hangmen[this.round].word);

          this.errors = this.opened = 0;
          this.chosen = new Array(30).fill(false);
          this.imageURL = '../../../assets/images/gallows.png';

          if (this.isBlue) {
            this.spectator = true;
            this.watch();
          }
          else {
            this.spectator = false;
          }
        }, 1000);
      }
    }
  }

}
