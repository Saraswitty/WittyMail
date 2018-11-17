import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignContentsComponent } from './design-contents.component';

describe('DesignContentsComponent', () => {
  let component: DesignContentsComponent;
  let fixture: ComponentFixture<DesignContentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesignContentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignContentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
