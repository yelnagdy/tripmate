import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestimonialsComponent } from './testimonials.component';

describe('TestimonialsComponent', () => {
  let fixture: ComponentFixture<TestimonialsComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestimonialsComponent] }).compileComponents();
    fixture = TestBed.createComponent(TestimonialsComponent);
  });
  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
