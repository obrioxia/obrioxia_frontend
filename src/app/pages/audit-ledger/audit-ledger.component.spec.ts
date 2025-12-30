import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuditLedgerComponent } from './audit-ledger.component';
import { FormsModule } from '@angular/forms'; // ✅ Added for ngModel support
import { provideHttpClient } from '@angular/common/http'; // ✅ Added to support LogsService

describe('AuditLedgerComponent', () => {
  let component: AuditLedgerComponent;
  let fixture: ComponentFixture<AuditLedgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // We import the standalone component and the required FormsModule
      imports: [AuditLedgerComponent, FormsModule],
      providers: [
        provideHttpClient() // Provides the backend connection tools for the service
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuditLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
