import { Component } from '@angular/core';

@Component({
  selector: 'app',
  templateUrl: './partials/app.html'
})

export class AppComponent {
  name: string;
  artists: any;

  onClick(myItem, myElement){
    // console.log(e.target); // e <= $event in (click) = "onClick($())"
    this.name = myItem.name;
    myElement.style.backgroundColor = "#FE04AE"
    console.log(this.name);
    console.log(myElement);
  }

  addArtist(value, e){
      this.artists.push({
        name: value,
        school: "SAP Next Gen"
      });
      console.log(JSON.stringify(this.artists));
      console.log(e.target);
  }

  constructor() {
    this.name = 'Xhou Ta';
    this.artists = [
      {
        name: 'Barot Bellingham',
        school: 'Penn State'
      }, {
        name: 'Jonathan Ferrar',
        school: 'University of Illinois'
      }, {
        name: 'Hillary Post',
        school: 'University of Florida'
      }
    ]
  }
}
