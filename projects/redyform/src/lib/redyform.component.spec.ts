import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedyformComponent } from './redyform.component';
import { RedyformModule } from './redyform.module';

describe('RedyformComponent', () => {
  let component: RedyformComponent;
  let fixture: ComponentFixture<RedyformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RedyformModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedyformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
