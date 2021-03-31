import { AfterViewInit, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements AfterViewInit {

  @Input() type: string = 'text';
  @Input() value: string = '';
  @Input() placeholder: string = '';
  @Input() dissabled: boolean = false;

  constructor() { }

  ngAfterViewInit(): void { }
}