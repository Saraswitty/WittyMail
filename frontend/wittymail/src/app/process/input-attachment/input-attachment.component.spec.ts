import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputAttachmentComponent } from './input-attachment.component';

describe('InputAttachmentComponent', () => {
  let component: InputAttachmentComponent;
  let fixture: ComponentFixture<InputAttachmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputAttachmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
