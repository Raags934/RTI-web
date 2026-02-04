import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sidebar } from './sidebar';
import { provideRouter,Router } from '@angular/router';

fdescribe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;
  let router:Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers:[provideRouter([])
    ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    router=TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should toggle menuClosed when onMenuClick is called',() =>{
    component.menuClosed = false;
    component.onMenuclick();
    expect(component.menuClosed).toBeTrue();
    component.onMenuclick();
    expect(component.menuClosed).toBeFalse();
  });
  it('should navigate to home when gotoHome is called',() =>{
    const navigateSpy=spyOn(router,'navigate');
    component.gotoHome();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });
});
