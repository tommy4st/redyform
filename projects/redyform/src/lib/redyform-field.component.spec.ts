import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedyformFieldComponent } from './redyform-field.component';
import { RedyformModule } from './redyform.module';

describe('RedyformFieldComponent', () => {
  let component: RedyformFieldComponent;
  let fixture: ComponentFixture<RedyformFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RedyformModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedyformFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
