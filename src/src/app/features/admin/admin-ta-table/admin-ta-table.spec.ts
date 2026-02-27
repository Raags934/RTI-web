import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTaTable } from './admin-ta-table';

describe('AdminTaTable', () => {
  let component: AdminTaTable;
  let fixture: ComponentFixture<AdminTaTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTaTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTaTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
