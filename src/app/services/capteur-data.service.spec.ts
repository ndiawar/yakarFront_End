import { TestBed } from '@angular/core/testing';

import { CapteurDataService } from './capteur-data.service';

describe('CapteurDataService', () => {
  let service: CapteurDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CapteurDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
