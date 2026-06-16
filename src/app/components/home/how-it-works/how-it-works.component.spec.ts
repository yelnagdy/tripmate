import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HowItWorksComponent } from './how-it-works.component';

describe('HowItWorksComponent', () => {
  let fixture: ComponentFixture<HowItWorksComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HowItWorksComponent] }).compileComponents();
    fixture = TestBed.createComponent(HowItWorksComponent);
  });
  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
