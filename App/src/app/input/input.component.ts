import { AfterViewInit, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements AfterViewInit {

  @Input() type: string = 'text';
  @Input() classList: string = '';
  @Input() text: string = '';
  @Input() placeHolder: string = 'text';
  @Input() key: string = '';

  constructor() { }

  ngAfterViewInit(): void { }
}