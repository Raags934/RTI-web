import { ComponentFixture, TestBed } from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import { Toast } from './toast';
import { FixedSizeVirtualScrollStrategy } from '@angular/cdk/scrolling';

fdescribe('Toast', () => {
  let component: Toast;
  let fixture: ComponentFixture<Toast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Toast]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Toast);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have default values',()=>{
    expect(component.message).toBe('');
    expect(component.show).toBeFalse();
  });
  it('should display message when show is true',()=>{
    component.message='Success!';
    component.show=true;
    fixture.detectChanges();
    const toastE1=fixture.debugElement.query(By.css('.toast'));
    expect(toastE1).toBeTruthy();
    expect(toastE1.nativeElement.textContent).toContain('Success!');
  });
  it('should not display toast when show is false',()=>{
    component.message='Hidden Message';
    component.show=false;
    fixture.detectChanges();
    const toastE1=fixture.debugElement.query(By.css('.toast'));
    expect(toastE1).toBeNull();
  });

});
