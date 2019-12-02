import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar'

import { UserService } from '../../services';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  logout(): void {
    this.userService.logout();
    this.snackBar.open('Uspešno ste se odjavili. Doviđenja!');
    this.router.navigate(['login']);
  }

}
