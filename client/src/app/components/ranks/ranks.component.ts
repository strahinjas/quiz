import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService, GameService } from '../../services';

export interface Record {
  player: string;
  points: number;
}

@Component({
  selector: 'app-ranks',
  templateUrl: './ranks.component.html',
  styleUrls: ['./ranks.component.css']
})
export class RanksComponent implements OnInit {
  twentyDays: Record[] = [];
  month: Record[] = [];

  displayedColumns = ['position', 'player', 'points'];

  constructor(
    private userService: UserService,
    private gameService: GameService,
    private router: Router) { }

  ngOnInit() {
    this.loadTwentyDays();
    this.loadMonth();
  }

  loadTwentyDays() {
    this.gameService.getLastTwentyDays().subscribe((data: any) => {
      for (const record of data) this.twentyDays.push(record);
    });
  }

  loadMonth() {
    this.gameService.getLastMonth().subscribe((data: any) => {
      for (const record of data) this.month.push(record);
    });
  }

  goBack() {
    const role = this.userService.loggedUser.role;
    this.router.navigate([role]);
  }

}
