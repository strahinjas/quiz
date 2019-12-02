import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { User, Goblet, Evaluation } from '../../models';
import { UserService, GameService, RealTimeService } from '../../services';

const GOBLET_ROWS = 13;

@Component({
  selector: 'app-supervisor',
  templateUrl: './supervisor.component.html',
  styleUrls: ['./supervisor.component.css']
})
export class SupervisorComponent implements OnInit {
  categories = {
    'country': 'Država',
    'city': 'Grad',
    'lake': 'Jezero',
    'mountain': 'Planina',
    'river': 'Reka',
    'animal': 'Životinja',
    'plant': 'Biljka',
    'band': 'Muzička grupa'
  };

  lengths = [9, 8, 7, 6, 5, 4, 3, 4, 5, 6, 7, 8, 9];

  supervisor: User;
  option = 1;

  fileName: string;
  rebus: File = null;

  anagramForm: FormGroup;
  hangmanForm: FormGroup;
  geoForm: FormGroup;
  gobletForm: FormGroup;

  evaluations: Evaluation[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private gameService: GameService,
    private snackBar: MatSnackBar,
    private realTime: RealTimeService) { }

  ngOnInit() {
    this.anagramForm = this.formBuilder.group({
      riddle: [null, [Validators.pattern(/^[a-zA-Z\u0100-\u017F ]+$/)]],
      solution: [null, [Validators.required, Validators.pattern(/^[a-zA-Z\u0100-\u017F ]+$/)]]
    });

    this.hangmanForm = this.formBuilder.group({
      word: [null, [Validators.required, Validators.pattern(/^[a-zA-Z\u0100-\u017F]+$/)]]
    });

    this.geoForm = this.formBuilder.group({
      evals: this.formBuilder.array([])
    });

    this.gobletForm = this.formBuilder.group({
      rows: this.formBuilder.array([])
    });
    for (let i = 0; i < GOBLET_ROWS; i++) {
      this.rows.push(this.formBuilder.group({
        question: [null, [Validators.required]],
        answer: [null, [
          Validators.required,
          Validators.minLength(this.lengths[i]),
          Validators.maxLength(this.lengths[i]),
          Validators.pattern(/^[a-zA-Z0-9\u0100-\u017F ]+$/)
        ]]
      }));
    }

    this.userService.getProfile().subscribe((profile: any) => {
      this.supervisor = profile.user;
      this.userService.loggedUser = this.supervisor;

      this.loadEvaluations();
    });
  }

  get anagram() { return this.anagramForm.controls; }
  get hangman() { return this.hangmanForm.controls; }

  get evals() { return this.geoForm.get('evals') as FormArray; }

  get rows() { return this.gobletForm.get('rows') as FormArray; }

  rebusUpload(event: any) {
    let files = event.target.files;

    if (files.length === 0) {
      this.fileName = '';
      this.rebus = null;
    }
    else {
      if (files[0].size > 5 * 1024 * 1024) {
        this.snackBar.open('Maksimalna veličina slike mora biti 5MB.');
      }
      else {
        this.fileName = files[0].name;
        this.rebus = files[0];
      }
    }
  }

  convertToFormData(): FormData {
    let formData = new FormData();

    for (const key of Object.keys(this.anagramForm.value)) {
      formData.append(key, this.anagramForm.value[key]);
    }

    formData.append('rebus', this.rebus);
    return formData;
  }

  saveAnagram() {
    if ((!this.anagram.riddle.value || this.anagram.riddle.value === '') && !this.rebus) {
      this.snackBar.open('Morate uneti anagram ili sliku rebusa!');
    }
    else {
      this.gameService.saveAnagram(this.convertToFormData()).subscribe((data: any) => {
        this.snackBar.open(data.message);
        if (data.success) {
          this.rebus = null;
          this.fileName = '';
          this.anagram.riddle.reset();
          this.anagram.solution.reset();
        }
      });
    }
  }

  saveHangman() {
    this.gameService.saveHangman({ word: this.hangman.word.value }).subscribe((data: any) => {
      this.snackBar.open(data.message);
      if (data.success) this.hangman.word.reset();
    });
  }

  loadEvaluations() {
    this.evals.clear();
    this.geoForm.reset();

    this.gameService.getEvaluations().subscribe((data: any) => {
      this.evaluations = data.evals;
      
      for (const record of this.evaluations) {
        let array = this.formBuilder.array([]);

        for (const term of record.terms) array.push(this.formBuilder.control(null));

        this.evals.push(array);
      }
    });
  }

  evaluate(i: number) {
    let points = 0;
    let boxes = (this.evals.at(i) as FormArray).controls;
    
    for (let j = 0; j < boxes.length; j++) {
      if (boxes[j].value) {
        points += 4;
        this.gameService.saveTerm(this.evaluations[i].terms[j]).subscribe();
      }
    }

    this.realTime.sendEvaluation(this.evaluations[i].game, points);
    this.gameService.removeEvaluation(this.evaluations[i]._id).subscribe();

    this.evals.removeAt(i);

    let filtered = this.evaluations.filter((value, index, array) => {
      return index !== i;
    });

    this.evaluations = filtered;
  }

  areValid(answer1: string, answer2: string): boolean {
    let valid = false;
    const longer  = answer1.length > answer2.length ? answer1 : answer2;
    const shorter = answer1.length < answer2.length ? answer1 : answer2;

    if (longer.length - shorter.length === 1) {
      valid = true;
      for (const letter of shorter) {
        if (!longer.includes(letter)) {
          valid = false;
          break;
        }
      }
    }

    return valid;
  }

  saveGoblet() {
    let goblet = new Goblet();
    goblet.rows = [];

    for (let i = 0; i < GOBLET_ROWS; i++) {
      goblet.rows.push({
        question: this.rows.at(i).value['question'],
        answer: this.rows.at(i).value['answer'].toLowerCase()
      });
    }

    for (let i = 0; i < GOBLET_ROWS - 1; i++) {
      if (!this.areValid(goblet.rows[i].answer, goblet.rows[i + 1].answer)) {
        this.snackBar.open('Susedni odgovori se moraju razlikovati u najviše jednom slovu.');
        return;
      }
    }

    this.gameService.saveGoblet(goblet).subscribe((data: any) => {
      this.snackBar.open(data.message);
      if (data.success) this.rows.reset();
    });
  }

}
