import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Anagram, Hangman, Goblet } from '../models';

import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class RealTimeService {

  readonly url: string = 'http://localhost:5000';

  supervisorSocket: SocketIOClient.Socket;
  multiplayerSocket: SocketIOClient.Socket;

  constructor() {
    this.supervisorSocket = io(`${this.url}/supervisor`);
    this.multiplayerSocket = io(`${this.url}/multiplayer`);
  }

  // Supervisor Terms Evaluation

  getEvaluation(gameID: string) {
    console.log('get eval');
    this.supervisorSocket.emit('getEvaluation', gameID);

    return new Observable(subscriber => {
      this.supervisorSocket.on('evaluated', data => {
        subscriber.next(data);
      });
    });
  }

  sendEvaluation(gameID: string, points: number) {
    console.log('send eval');
    this.supervisorSocket.emit('evaluated', gameID, points);
  }

  // Match Creation

  createMatch(username: string) {
    this.multiplayerSocket.emit('create', username);

    return new Observable(subscriber => {
      this.multiplayerSocket.on('joined', data => {
        subscriber.next(data);
      });
    });
  }

  cancelMatch(username: string) {
    this.multiplayerSocket.emit('cancel', username);
  }

  joinMatch(username: string) {
    this.multiplayerSocket.emit('join', username);

    return new Observable(subscriber => {
      this.multiplayerSocket.on('joined', data => {
        subscriber.next(data);
      });
    });
  }

  // Anagram

  sendAnagrams(anagrams: Anagram[]) {
    this.multiplayerSocket.emit('anagrams', anagrams);
  }

  getAnagrams() {
    return new Observable(subscriber => {
      this.multiplayerSocket.on('anagrams', data => {
        subscriber.next(data);
      });
    });
  }

  sendSolutions(isBlue: boolean, correct: boolean[]) {
    const event = isBlue ? 'blueAnagram' : 'redAnagram';
    this.multiplayerSocket.emit(event, correct);
  }

  getSolutions(isBlue: boolean) {
    const event = !isBlue ? 'blueAnagram' : 'redAnagram';

    return new Observable(subscriber => {
      this.multiplayerSocket.on(event, data => {
        subscriber.next(data);
      });
    });
  }

  sendRedAnagram(correct: boolean[]) {
    this.multiplayerSocket.emit('redAnagram', correct);
  }

  // My Number

  getNumbers() {
    return new Observable(subscriber => {
      this.multiplayerSocket.on('numbers', data => {
        subscriber.next(data);
      });
    });
  }

  sendNumbers(data: any) {
    this.multiplayerSocket.emit('numbers', data);
  }

  getRedResult() {
    return new Observable(subscriber => {
      this.multiplayerSocket.on('redResult', data => {
        subscriber.next(data);
      });
    });
  }

  sendRedResult(result: number) {
    this.multiplayerSocket.emit('redResult', result);
  }

  getPoints() {
    return new Observable(subscriber => {
      this.multiplayerSocket.on('points', data => {
        subscriber.next(data);
      });
    });
  }

  sendPoints(points: any) {
    this.multiplayerSocket.emit('points', points);
  }

  // Hangman

  getHangmen() {
    return new Observable(subscriber => {
      this.multiplayerSocket.on('hangmen', data => {
        subscriber.next(data);
      });
    });
  }

  sendHangmen(hangmen: Hangman[]) {
    this.multiplayerSocket.emit('hangmen', hangmen);
  }

  getSelectedLetter() {
    return new Observable(subscriber => {
      this.multiplayerSocket.on('hangmanLetter', data => {
        subscriber.next(data);
      });
    });
  }

  sendSelectedLetter(letter: string) {
    this.multiplayerSocket.emit('hangmanLetter', letter);
  }

  // Geography

  getLetter() {
    return new Observable(subscriber => {
      this.multiplayerSocket.on('letter', data => {
        subscriber.next(data);
      });
    });
  }

  sendLetter(letter: string) {
    this.multiplayerSocket.emit('letter', letter);
  }

  getTerms() {
    return new Observable(subscriber => {
      this.multiplayerSocket.on('terms', data => {
        subscriber.next(data);
      });
    });
  }

  sendTerms(terms: any) {
    this.multiplayerSocket.emit('terms', terms);
  }

  getMissingTerms() {
    return new Observable(subscriber => {
      this.multiplayerSocket.on('missingTerms', data => {
        subscriber.next(data);
      });
    });
  }

  sendMissingTerms(leftEmpty: string[]) {
    this.multiplayerSocket.emit('missingTerms', leftEmpty);
  }

  getNextRound() {
    return new Observable(subscriber => {
      this.multiplayerSocket.on('nextRound', data => {
        subscriber.next(data);
      });
    });
  }

  sendNextRound() {
    this.multiplayerSocket.emit('nextRound');
  }

  getGeoPoints(isBlue: boolean) {
    const event = !isBlue ? 'bluePoints' : 'redPoints';

    return new Observable(subscriber => {
      this.multiplayerSocket.on(event, data => {
        subscriber.next(data);
      });
    });
  }

  sendGeoPoints(isBlue: boolean, points: number) {
    const event = isBlue ? 'bluePoints' : 'redPoints';
    this.multiplayerSocket.emit(event, points);
  }

  // Goblet

  getGoblets() {
    return new Observable(subscriber => {
      this.multiplayerSocket.on('goblets', data => {
        subscriber.next(data);
      });
    });
  }

  sendGoblets(goblets: Goblet[]) {
    this.multiplayerSocket.emit('goblets', goblets);
  }

  getAnswer() {
    return new Observable(subscriber => {
      this.multiplayerSocket.on('answer', data => {
        subscriber.next(data);
      });
    });
  }

  sendAnswer(answer: string) {
    this.multiplayerSocket.emit('answer', answer);
  }

}
