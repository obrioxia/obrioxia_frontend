import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccessGateComponent } from './access-gate.component';
import { FormsModule } from '@angular/forms'; // ✅ Required for components using ngModel
import { provideHttpClient } from '@angular/common/http'; // ✅ Required for ApiService dependency

describe('AccessGateComponent', () => {
  let component: AccessGateComponent;
  let fixture: ComponentFixture<AccessGateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // In Standalone testing, we import the component and its necessary modules
      imports: [AccessGateComponent, FormsModule],
      providers: [
        provideHttpClient() // Satisfies the ApiService used in the component logic
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccessGateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
