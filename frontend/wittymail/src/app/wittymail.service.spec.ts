import { TestBed } from '@angular/core/testing';

import { WittymailService } from './wittymail.service';

describe('WittymailService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WittymailService = TestBed.get(WittymailService);
    expect(service).toBeTruthy();
  });
});
