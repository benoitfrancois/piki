import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TypeManagerComponent } from './type-manager';

describe('TypeManagerComponent', () => {
  let component: TypeManagerComponent;
  let fixture: ComponentFixture<TypeManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeManagerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TypeManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
