import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputSheetComponent } from './input-sheet.component';

describe('InputSheetComponent', () => {
  let component: InputSheetComponent;
  let fixture: ComponentFixture<InputSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
