import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfPageComponent } from './inf-page.component';

describe('InfPageComponent', () => {
  let component: InfPageComponent;
  let fixture: ComponentFixture<InfPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
