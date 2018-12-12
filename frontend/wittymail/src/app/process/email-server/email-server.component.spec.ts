import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailServerComponent } from './email-server.component';

describe('EmailServerComponent', () => {
  let component: EmailServerComponent;
  let fixture: ComponentFixture<EmailServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailServerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
