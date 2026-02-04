import { ComponentFixture, TestBed } from '@angular/core/testing';

<<<<<<<< HEAD:src/src/app/features/admin/admin-product/admin-product.spec.ts
import { AdminProduct } from './admin-product';

describe('AdminProduct', () => {
  let component: AdminProduct;
  let fixture: ComponentFixture<AdminProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProduct);
========
import { IdeaHistory } from './idea-history';

describe('IdeaHistory', () => {
  let component: IdeaHistory;
  let fixture: ComponentFixture<IdeaHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdeaHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdeaHistory);
>>>>>>>> 6c3839145be05a5593c1ca8c36c0c99e71481a3a:src/src/app/features/ideas/idea-history/idea-history.spec.ts
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
