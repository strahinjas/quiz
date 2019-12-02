import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { Term } from '../../models';
import { MyErrorStateMatcher, UserService, GameService, ValidateService, RealTimeService } from '../../services';

const ALPHABET = [
  'A', 'B', 'C', 'Č', 'Ć', 'D', 'Dž', 'Đ', 'E', 'F',
  'G', 'H', 'I', 'J', 'K', 'L', 'Lj', 'M', 'N', 'Nj',
  'O', 'P', 'R', 'S', 'Š', 'T', 'U', 'V', 'Z', 'Ž'
];

const CATEGORIES = ['country', 'city', 'lake', 'mountain', 'river', 'animal', 'plant', 'band'];

@Component({
  selector: 'app-geography',
  templateUrl: './geography.component.html',
  styleUrls: ['./geography.component.css']
})
export class GeographyComponent implements OnInit, OnDestroy {
  single: boolean;
  isBlue: boolean;
  spectator: boolean;

  stopped: boolean;
  letter = ALPHABET[0];

  geoForm: FormGroup;

  matcher = new MyErrorStateMatcher();

  timeout; redirect;
  timer; interval; loopInterval;

  round = 0;
  timeLeft = 120;

  points = 0;
  othersPoints: number;

  leftEmpty: string[];

  subsPoints: Subscription;
  supervisor: Subscription;
  formChange: Subscription;
  subscription: Subscription;
  missingTerms: Subscription;
  nextRound: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private gameService: GameService,
    private validator: ValidateService,
    private realTime: RealTimeService) { }

  ngOnInit() {
    this.geoForm = this.formBuilder.group({
      country: [{ value: null, disabled: true }],
      city: [{ value: null, disabled: true }],
      lake: [{ value: null, disabled: true }],
      mountain: [{ value: null, disabled: true }],
      river: [{ value: null, disabled: true }],
      animal: [{ value: null, disabled: true }],
      plant: [{ value: null, disabled: true }],
      band: [{ value: null, disabled: true }]
    });

    this.single = this.route.snapshot.paramMap.get('mode') === 'singleplayer';

    if (this.single) this.startLoop();
    else {
      this.isBlue = this.userService.loggedUser.username === this.gameService.activeMatch.blue;

      this.subsPoints = this.realTime.getGeoPoints(this.isBlue).subscribe((points: number) => {
        this.othersPoints = points;
      });

      this.spectator = this.isBlue;
      this.startLoop();

      if (this.spectator) {
        this.subscription = this.realTime.getLetter().subscribe((letter: string) => {
          this.stopped = true;
          clearInterval(this.loopInterval);

          this.letter = letter;
          this.startTimer(120);
          this.watch();
          this.getMissingTerms();
          this.onNextRound();
        });
      }
      else this.onFormChange();
    }
  }

  ngOnDestroy() {
    this.stopTimer();
    clearTimeout(this.timeout);
    clearTimeout(this.redirect);
    clearInterval(this.loopInterval);
    if (this.subsPoints) this.subsPoints.unsubscribe();
    if (this.supervisor) this.supervisor.unsubscribe();
    if (this.formChange) this.formChange.unsubscribe();
    if (this.subscription) this.subscription.unsubscribe();
    if (this.missingTerms) this.missingTerms.unsubscribe();
    if (this.nextRound) this.nextRound.unsubscribe();
  }

  get form() { return this.geoForm.controls; }

  onFormChange() {
    if (this.formChange) this.formChange.unsubscribe();
    this.formChange = this.geoForm.valueChanges.subscribe(value => {
      this.realTime.sendTerms(value);
    });
  }

  watch() {
    if (this.formChange) this.formChange.unsubscribe();
    this.formChange = this.realTime.getTerms().subscribe((terms: any) => {
      for (const category in terms) {
        this.form[category].setValue(terms[category]);
      }
    });
  }

  getMissingTerms() {
    if (this.missingTerms) this.missingTerms.unsubscribe();
    this.missingTerms = this.realTime.getMissingTerms().subscribe((terms: string[]) => {
      this.stopTimer();
      this.nextRound.unsubscribe();
      this.leftEmpty = terms;

      for (const category of terms) {
        this.form[category].enable();
        this.form[category].setValidators(this.validator.validateTerm(this.letter));
        this.form[category].updateValueAndValidity();
      }

      this.spectator = false;
      this.onFormChange();
      this.startTimer(30);
    });
  }

  onNextRound() {
    if (this.nextRound) this.nextRound.unsubscribe();
    this.nextRound = this.realTime.getNextRound().subscribe(() => {
      this.next();
    });
  }

  startTimer(seconds: number) {
    this.timeLeft = seconds;
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) --this.timeLeft;
      if (this.timeLeft === 0 && !this.spectator) {
        if (seconds === 120) this.checkTerms();
        else this.checkReducedTerms();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timer);
  }

  startLoop() {
    this.stopped = false;
    this.loopInterval = setInterval(() => {
      let random = Math.floor(Math.random() * ALPHABET.length);
      this.letter = ALPHABET[random];
    }, 50);
  }

  stopLoop() {
    this.stopped = true;
    clearInterval(this.loopInterval);
    this.realTime.sendLetter(this.letter);

    for (let control in this.form) {
      this.form[control].enable();
      this.form[control].setValidators(this.validator.validateTerm(this.letter));
      this.form[control].updateValueAndValidity();
    }

    this.startTimer(120);
  }

  switch() {
    for (let control in this.form) this.form[control].disable();
    this.realTime.sendMissingTerms(this.leftEmpty);
    this.spectator = true;
    this.watch();
    this.onNextRound();
    this.startTimer(30);
  }

  checkTerms() {
    if ((this.round === 0 && this.isBlue) || (this.round === 1 && !this.isBlue)) {
      this.checkReducedTerms();
      return;
    }

    this.stopTimer();

    if (this.single) {
      let i = 0;
      let terms: Term[] = [];
      let game = this.gameService.todayGame;

      for (let control in this.form) {
        if (this.form[control].value) {
          let term: Term = {
            category: CATEGORIES[i],
            term: this.form[control].value.toLowerCase()
          };
          terms.push(term);
        }
        i++;
      }

      if (terms.length > 0) {
        this.gameService.checkTerms(terms, game._id).subscribe((data: any) => {
          let points = data.points;
          let possiblePoints = data.possiblePoints;

          if (possiblePoints > 0) {
            this.snackBar.open('Molimo sačekajte da supervizor evaluira Vaše odgovore.');
            this.supervisor = this.realTime.getEvaluation(game._id).subscribe(data => {
              points += data;

              game.points += points;
              game.pointsPerGame.push(points);
              this.gameService.todayGame = game;
              this.gameService.updateGame().subscribe();

              this.snackBar.open(`Osvojili ste ${points} poena.`);

              this.redirect = setTimeout(() => {
                this.router.navigate(['goblet', 'singleplayer']);
              }, 2000);
            });
          }
          else {
            this.snackBar.open(`Osvojili ste ${points} poena.`);

            game.points += points;
            game.pointsPerGame.push(points);
            this.gameService.todayGame = game;
            this.gameService.updateGame().subscribe();

            this.redirect = setTimeout(() => {
              this.router.navigate(['goblet', 'singleplayer']);
            }, 2000);
          }
        });
      }
      else {
        this.snackBar.open(`Niste osvojili nijedan poen.`);

        game.pointsPerGame.push(0);
        this.gameService.todayGame = game;
        this.gameService.updateGame().subscribe();

        this.redirect = setTimeout(() => {
          this.router.navigate(['goblet', 'singleplayer']);
        }, 2000);
      }
    }

    // MULTIPLAYER

    else {
      let i = 0;
      this.leftEmpty = [];
      let terms: Term[] = [];
      let username = this.userService.loggedUser.username;

      for (let control in this.form) {
        if (this.form[control].value) {
          let term: Term = {
            category: CATEGORIES[i],
            term: this.form[control].value.toLowerCase()
          };
          terms.push(term);
        }
        else this.leftEmpty.push(CATEGORIES[i]);
        i++;
      }

      if (terms.length > 0) {
        this.gameService.checkTerms(terms, username).subscribe((data: any) => {
          this.points += data.points;
          let possiblePoints = data.possiblePoints;

          if (possiblePoints > 0) {
            this.snackBar.open('Molimo sačekajte da supervizor evaluira Vaše odgovore.');
            if (this.supervisor) this.supervisor.unsubscribe();
            this.supervisor = this.realTime.getEvaluation(username).subscribe(data => {
              this.points += data as number;

              if (this.leftEmpty.length > 0) this.switch();
              else this.next();
            });
          }
          else if (this.leftEmpty.length > 0) this.switch();
          else this.next();
        });
      }
      else if (this.leftEmpty.length > 0) this.switch();
      else this.next();
    }
  }

  checkReducedTerms() {
    this.stopTimer();

    let terms: Term[] = [];
    let username = this.userService.loggedUser.username;

    for (const category of this.leftEmpty) {
      if (this.form[category].value) {
        let term: Term = {
          category: category,
          term: this.form[category].value.toLowerCase()
        };
        terms.push(term);
      }
    }

    if (terms.length > 0) {
      this.gameService.checkTerms(terms, username).subscribe((data: any) => {
        this.points += (data.points / 2) * 3;
        let possiblePoints = data.possiblePoints;

        if (possiblePoints > 0) {
          this.snackBar.open('Molimo sačekajte da supervizor evaluira Vaše odgovore.');
          if (this.supervisor) this.supervisor.unsubscribe();
          this.supervisor = this.realTime.getEvaluation(username).subscribe(data => {
            this.points += ((data as number) / 4) * 5;

            this.next();
          });
        }
        else this.next();
      });
    }
    else this.next();
  }

  next() {
    if (!this.spectator) {
      this.realTime.sendNextRound();
    }
    else {
      this.stopTimer();
      this.nextRound.unsubscribe();
      if (this.missingTerms) this.missingTerms.unsubscribe();
    }
    
    if (this.round === 1) {
      this.finish();
      return;
    }

    this.round++;
    for (let control in this.form) {
      this.form[control].disable();
      this.form[control].setValue(null);
    }
    this.spectator = !this.isBlue;
    this.startLoop();

    if (this.spectator) {
      this.subscription = this.realTime.getLetter().subscribe((letter: string) => {
        this.stopped = true;
        clearInterval(this.loopInterval);

        this.letter = letter;
        this.startTimer(120);
        this.watch();
        this.getMissingTerms();
        this.onNextRound();
      });
    }
    else {
      this.nextRound.unsubscribe();
      this.missingTerms.unsubscribe();
      this.subscription.unsubscribe();
      this.onFormChange();
    }
  }

  finish() {
    this.realTime.sendGeoPoints(this.isBlue, this.points);
    this.timeout = setTimeout(() => {
      let bluePoints = this.isBlue ? this.points : this.othersPoints;
      let redPoints = !this.isBlue ? this.points : this.othersPoints;

      let match = this.gameService.activeMatch;

      match.bluePoints += bluePoints;
      match.bluePointsPerGame.push(bluePoints);
      match.redPoints += redPoints;
      match.redPointsPerGame.push(redPoints);

      this.gameService.activeMatch = match;
      this.gameService.updateMatch().subscribe();
      this.snackBar.open(`Plavi takmičar: ${bluePoints} | Crveni takmičar: ${redPoints}`);

      this.redirect = setTimeout(() => {
        this.router.navigate(['goblet', 'multiplayer']);
      }, 2000);
    }, 1000);
  }

}
