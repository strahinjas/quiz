import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';

import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';

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

import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './modules';

import { AlertService, UserService, ValidateService, GameService, RealTimeService } from './services';

import { JwtInterceptor } from './services';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    LoginComponent,
    RegisterComponent,
    PasswordChangeComponent,
    SecretQuestionComponent,
    RanksComponent,
    AdminComponent,
    SupervisorComponent,
    PlayerComponent,
    AnagramComponent,
    MyNumberComponent,
    HangmanComponent,
    GeographyComponent,
    GobletComponent,
    ResultComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    MaterialModule
  ],
  providers: [
    AlertService,
    UserService,
    ValidateService,
    GameService,
    RealTimeService,

    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
