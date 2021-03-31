import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-drop-down',
  templateUrl: './drop-down.component.html',
  styleUrls: ['./drop-down.component.css']
})
export class DropDownComponent implements OnInit {
  selection: any;
  buttonText: string = 'Selección';
  constructor() { }

  @Input() data: any = [];
  @Output() selectElement = new EventEmitter<string>();

  /* selectElement = (elem: any) => {
    this.selection = elem;
    return elem;
  } */

  ngOnInit(): void {
  }

}
