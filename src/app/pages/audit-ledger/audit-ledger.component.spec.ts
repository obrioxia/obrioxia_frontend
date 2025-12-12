import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditLedgerComponent } from './audit-ledger.component';

describe('AuditLedgerComponent', () => {
  let component: AuditLedgerComponent;
  let fixture: ComponentFixture<AuditLedgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditLedgerComponent]
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
