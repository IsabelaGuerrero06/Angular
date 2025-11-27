import { TestBed } from '@angular/core/testing';

import { GeminiService } from './gemini.service';

describe('GeminiServiceService', () => {
  let service: GeminiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeminiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
