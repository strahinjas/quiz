import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { GameService } from 'src/app/services';

const GAMES = ['Anagram', 'Moj broj', 'Igra vešala', 'Zanimljiva geografija', 'Pehar'];

export interface Result {
  game: string;
  points: number;
}

export interface MatchResult {
  bluePoints: number;
  game: string;
  redPoints: number;
}

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {
  single: boolean;

  date: Date;

  total: number;

  totalBlue: number;
  totalRed: number;

  bluePlayer: string;
  redPlayer: string;

  dataSource: Result[] = [];
  matchSource: MatchResult[] = [];

  displayedColumns = ['game', 'points'];
  displayedMatchColumns = ['bluePoints', 'game', 'redPoints'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private gameService: GameService) { }

  ngOnInit() {
    this.single = this.route.snapshot.paramMap.get('mode') === 'singleplayer';

    if (this.single) {
      let game = this.gameService.todayGame;

      this.date = game.date;
      for (let i = 0; i < game.pointsPerGame.length; i++) {
        this.dataSource.push({
          game: GAMES[i],
          points: game.pointsPerGame[i]
        });
      }
      this.total = game.points;
    }
    else {
      let match = this.gameService.activeMatch;

      this.date = match.date;
      this.bluePlayer = match.blue;
      this.redPlayer = match.red;

      for (let i = 0; i < match.bluePointsPerGame.length; i++) {
        this.matchSource.push({
          bluePoints: match.bluePointsPerGame[i],
          game: GAMES[i],
          redPoints: match.redPointsPerGame[i]
        });
      }
      this.totalBlue = match.bluePoints;
      this.totalRed = match.redPoints;

      if (this.totalBlue > this.totalRed) match.outcome = 'blue';
      else if (this.totalBlue < this.totalRed) match.outcome = 'red';

      this.gameService.activeMatch = match;
    }
  }

  goBack() {
    if (this.single) this.gameService.updateGame().subscribe();
    else this.gameService.updateMatch().subscribe();
    this.router.navigate(['player']);
  }

}
