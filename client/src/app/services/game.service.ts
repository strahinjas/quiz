import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Hangman, Term, Goblet, Game, Match } from '../models';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  apiURL: string = 'http://localhost:5000';

  constructor(private http: HttpClient) { }

  get todayGame() { return JSON.parse(sessionStorage.getItem('todayGame')); }
  get activeMatch() { return JSON.parse(sessionStorage.getItem('activeMatch')); }

  set todayGame(game: Game) { sessionStorage.setItem('todayGame', JSON.stringify(game)); }
  set activeMatch(match: Match) { sessionStorage.setItem('activeMatch', JSON.stringify(match)); }

  // Anagrams

  getAnagrams() {
    return this.http.get(`${this.apiURL}/games/anagram/all`);
  }

  getAnagram() {
    const params = new HttpParams().set('id', this.todayGame.anagramID);
    return this.http.get(`${this.apiURL}/games/anagram/one`, { params });
  }

  getAnagramPair() {
    return this.http.get(`${this.apiURL}/games/anagram/pair`);
  }

  saveAnagram(formData: FormData) {
    return this.http.post(`${this.apiURL}/games/anagram`, formData);
  }

  // Hangmen

  getHangmanPair() {
    return this.http.get(`${this.apiURL}/games/hangman`);
  }

  saveHangman(hangman: Hangman) {
    return this.http.post(`${this.apiURL}/games/hangman`, hangman);
  }

  // Geography terms

  saveTerm(term: Term) {
    return this.http.post(`${this.apiURL}/games/term/store`, term);
  }

  checkTerms(terms: Term[], id: string) {
    return this.http.post(`${this.apiURL}/games/term/check`, { terms, id });
  }

  getEvaluations() {
    return this.http.get(`${this.apiURL}/games/eval`);
  }

  removeEvaluation(id: string) {
    const params = new HttpParams().set('id', id);
    return this.http.delete(`${this.apiURL}/games/eval`, { params });
  }

  // Goblets

  getGoblets() {
    return this.http.get(`${this.apiURL}/games/goblet/all`);
  }

  getGoblet() {
    const params = new HttpParams().set('id', this.todayGame.gobletID);
    return this.http.get(`${this.apiURL}/games/goblet/one`, { params });
  }

  getGobletPair() {
    return this.http.get(`${this.apiURL}/games/goblet/pair`);
  }

  saveGoblet(goblet: Goblet) {
    return this.http.post(`${this.apiURL}/games/goblet`, goblet);
  }

  // Game of the Day

  saveGame(date: Date, anagram: string, goblet: string) {
    return this.http.post(`${this.apiURL}/games/day/store`, { date, anagram, goblet });
  }

  playGame(date: Date, username: string) {
    return this.http.post(`${this.apiURL}/games/day/play`, { date, username });
  }

  updateGame() {
    return this.http.post(`${this.apiURL}/games/day/update`, this.todayGame);
  }

  getTodayRanks(username: string) {
    const params = new HttpParams().set('username', username);
    return this.http.get(`${this.apiURL}/games/day/ranks`, { params });
  }

  // Multiplayer Matches

  getMatches(username: string) {
    const params = new HttpParams().set('username', username);
    return this.http.get(`${this.apiURL}/matches/player`, { params });
  }

  getAvailableMatches() {
    return this.http.get(`${this.apiURL}/matches/available`);
  }

  updateMatch() {
    return this.http.post(`${this.apiURL}/matches/update`, this.activeMatch);
  }

  // Ranks

  getLastTwentyDays() {
    return this.http.get(`${this.apiURL}/matches/twenty_days`);
  }

  getLastMonth() {
    return this.http.get(`${this.apiURL}/matches/month`);
  }

}
