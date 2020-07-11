import {Component, ElementRef, ViewChild} from '@angular/core';
import {DragDropModule, CdkDragEnd} from '@angular/cdk/drag-drop';
import {MatButtonModule} from '@angular/material/button';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material';
import {MatSelectModule} from '@angular/material/select';
import {AngularFirestore} from '@angular/fire/firestore';
import {HttpClient} from '@angular/common/http';
import {Md5} from 'ts-md5/dist/md5';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  form: FormGroup;
  title = 'kompas';
  positions = {};
  candidates: string[] = [
    'Nie głosowałem',
    'Nie chcę odpowiadać',
    'A. Duda',
    'R. Trzaskowski',
    'S. Hołownia',
    'K. Bosak',
    'W. Kosiniak-Kamysz',
    'R. Biedroń',
    'W. Witkowski',
    'S. Żółtek',
    'P. Tanajno',
    'M. Jakubiak',
    'M. Piotrowski',
  ];
  ipAddress: string = null;
  showThanks: boolean = false;
  saving: boolean = false;

  constructor(
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    private http: HttpClient
  ) {
    this.form = new FormGroup({
      votedFor: this.fb.control(null, Validators.required),
      age: this.fb.control('', [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
      ]),
      intrest: this.fb.control('', [
        Validators.required,
        Validators.min(0),
        Validators.max(10),
      ]),
    });

    this.http.get<{ip: string}>('https://jsonip.com').subscribe(
      data => (this.ipAddress = data.ip),
      error => console.log('ip_error')
    );
    document.documentElement.style.setProperty(
      '--vh',
      String(window.innerHeight / 100 + 'px')
    );
  }

  dragEnd($event: CdkDragEnd) {
    const holderHigth = document.getElementById('holder').offsetHeight;
    const holderWidth = document.getElementById('holder').offsetWidth;
    const imageHeigth = document.getElementById('Duda').offsetHeight;
    const imageWidth = document.getElementById('Duda').offsetHeight;

    const drag = $event.source.getFreeDragPosition();
    const position = {x: drag.x, y: drag.y};
    position.x =
      (2 *
        (position.x +
          document.getElementById($event.source.element.nativeElement.id).offsetLeft)) /
        (holderHigth - imageHeigth) - 1;
    position.y = -1 * ((2 * position.y) / (holderWidth - imageWidth) - 1);

    this.positions[$event.source.element.nativeElement.id] = position;
  }

  saveData() {
    this.saving = true;
    const data = this.form.getRawValue();
    const res = {...data, ...this.positions};
    if (this.ipAddress) {
      res.id = Md5.hashStr(this.ipAddress);
    }


    this.firestore.collection('responses').add(res).then(
      res => {
        this.showThanks = true;
        this.saving = false;
      },
      error => {
        this.saving = false;
        alert('Wystąpił błąd, spróbuj ponownie');
      }
    );
  }
}
