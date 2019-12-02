import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PasswordChangeComponent } from './components/password-change/password-change.component';
import { SecretQuestionComponent } from './components/secret-question/secret-question.component';

import { RanksComponent } from './components/ranks/ranks.component';

import { AdminComponent } from './components/admin/admin.component';
import { SupervisorComponent } from './components/supervisor/supervisor.component';
import { PlayerComponent } from './components/player/player.component';

import { AnagramComponent } from './components/anagram/anagram.component';
import { MyNumberComponent } from './components/my-number/my-number.component';
import { HangmanComponent } from './components/hangman/hangman.component';
import { GeographyComponent } from './components/geography/geography.component';
import { GobletComponent } from './components/goblet/goblet.component';

import { ResultComponent } from './components/result/result.component';

import { AuthGuard } from './guards';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'password-change/:variant', component: PasswordChangeComponent },
  { path: 'question', component: SecretQuestionComponent },

  { path: 'ranks', component: RanksComponent },

  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard], data: { role: 'admin'} },
  { path: 'supervisor', component: SupervisorComponent, canActivate: [AuthGuard], data: { role: 'supervisor'} },
  { path: 'player', component: PlayerComponent, canActivate: [AuthGuard], data: { role: 'player'} },

  { path: 'anagram/:mode', component: AnagramComponent, canActivate: [AuthGuard], data: { role: 'player'} },
  { path: 'my-number/:mode', component: MyNumberComponent, canActivate: [AuthGuard], data: { role: 'player'} },
  { path: 'hangman/:mode', component: HangmanComponent, canActivate: [AuthGuard], data: { role: 'player'} },
  { path: 'geography/:mode', component: GeographyComponent, canActivate: [AuthGuard], data: { role: 'player'} },
  { path: 'goblet/:mode', component: GobletComponent, canActivate: [AuthGuard], data: { role: 'player'} },

  { path: 'result/:mode', component: ResultComponent, canActivate: [AuthGuard], data: { role: 'player'} },

  { path: '', redirectTo: '/login', pathMatch: 'full'},
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
