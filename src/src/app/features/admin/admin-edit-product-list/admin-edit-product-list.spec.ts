import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditProductList } from './admin-edit-product-list';

describe('AdminEditProductList', () => {
  let component: AdminEditProductList;
  let fixture: ComponentFixture<AdminEditProductList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEditProductList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEditProductList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
