import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TtsPlainComponent } from './tts-plain.component';

describe('TtsPlainComponent', () => {
  let component: TtsPlainComponent;
  let fixture: ComponentFixture<TtsPlainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TtsPlainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TtsPlainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
