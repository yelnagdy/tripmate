import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackagesComponent } from './backages.component';

describe('BackagesComponent', () => {
  let component: BackagesComponent;
  let fixture: ComponentFixture<BackagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
