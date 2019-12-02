import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { User, Game, Match } from '../../models';
import { UserService, GameService, RealTimeService } from '../../services';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit, OnDestroy {
  player: User;
  subscription: Subscription;

  interval; timeout;
  available = 0;
  waiting = false;

  ranks: Game[] = [];
  ranksColumns: string[] = ['position', 'player', 'points'];

  matches: Match[] = [];
  matchesColumns = ['date', 'blue', 'blue-points', 'red', 'red-points', 'outcome'];

  constructor(
    private userService: UserService,
    private gameService: GameService,
    private snackBar: MatSnackBar,
    private router: Router,
    private realTime: RealTimeService) { }

  ngOnInit() {
    this.userService.getProfile().subscribe((profile: any) => {
      this.player = profile.user;
      this.userService.loggedUser = this.player;

      this.interval = setInterval(() => {
        this.gameService.getAvailableMatches().subscribe((data: number) => this.available = data);
      }, 500);

      this.loadRanks();
      this.loadMatches();
    });
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
    clearInterval(this.interval);
    clearTimeout(this.timeout);
  }

  create() {
    this.waiting = true;
    this.subscription = this.realTime.createMatch(this.player.username).subscribe(data => {
      let match = data as Match;
      match.bluePointsPerGame = [];
      match.redPointsPerGame = [];
      this.gameService.activeMatch = match;

      this.waiting = false;
      this.snackBar.open('Vaša partija će uskoro početi.');

      this.timeout = setTimeout(() => {
        this.router.navigate(['anagram', 'multiplayer']);
      }, 2000);
    });
  }

  cancel() {
    this.subscription.unsubscribe();
    this.waiting = false;
    this.realTime.cancelMatch(this.player.username);
  }

  join() {
    this.subscription = this.realTime.joinMatch(this.player.username).subscribe(data => {
      let match = data as Match;
      match.bluePointsPerGame = [];
      match.redPointsPerGame = [];
      this.gameService.activeMatch = match;
      
      this.snackBar.open('Vaša partija će uskoro početi.');

      this.timeout = setTimeout(() => {
        this.router.navigate(['anagram', 'multiplayer']);
      }, 2000);
    });
  }

  todayGame() {
    this.gameService.playGame(new Date(), this.player.username).subscribe((data: any) => {
      if (data.success) {
        this.snackBar.open(data.message);

        let game: Game = data.game;
        game.pointsPerGame = [];
        game.anagramID = data.anagram;
        game.gobletID = data.goblet;

        this.gameService.todayGame = game;

        this.snackBar.open('Igra dana će uskoro početi.');

        this.timeout = setTimeout(() => {
          this.router.navigate(['anagram', 'singleplayer']);
        }, 2000);
      }
      else {
        this.snackBar.open(data.message);
      }
    });
  }

  loadRanks() {
    this.gameService.getTodayRanks(this.player.username).subscribe((data: any) => this.ranks = data);
  }

  loadMatches() {
    this.gameService.getMatches(this.player.username).subscribe((data: any) => this.matches = data);
  }

}
