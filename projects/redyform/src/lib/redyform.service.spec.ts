import { TestBed, inject } from '@angular/core/testing';

import { RedyformService } from './redyform.service';

describe('RedyformService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RedyformService]
    });
  });

  it('should be created', inject([RedyformService], (service: RedyformService) => {
    expect(service).toBeTruthy();
  }));
});
