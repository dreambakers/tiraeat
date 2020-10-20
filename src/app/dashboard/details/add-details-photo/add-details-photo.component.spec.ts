import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDetailsPhotoComponent } from './add-details-photo.component';

describe('AddDetailsPhotoComponent', () => {
  let component: AddDetailsPhotoComponent;
  let fixture: ComponentFixture<AddDetailsPhotoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDetailsPhotoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDetailsPhotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
