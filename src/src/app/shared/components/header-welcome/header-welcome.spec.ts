
import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HeaderWelcome } from './header-welcome';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { IdeaEventsService } from '../../../events/ideaServiceEvents';
import { headerConfigs, headerTitle } from '../../constants/headerTitle';

// Dummy component to serve as route targets
@Component({
  standalone: true,
  template: '<div>Dummy</div>',
})
class DummyComponent {}

fdescribe('HeaderWelcome', () => {
  let fixture: ComponentFixture<HeaderWelcome>;
  let component: HeaderWelcome;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderWelcome,
        RouterTestingModule.withRoutes([
          // Use your configured expected paths
          { path: headerConfigs.addIdeaHeader.expected, component: DummyComponent },
          { path: headerConfigs.myIdeasHeader.expected, component: DummyComponent },
          { path: headerConfigs.contactForHelpHeader.expected, component: DummyComponent },
          { path: headerConfigs.viewIdeaHeader.expected, component: DummyComponent },
          // Unknown route to hit default branch
          { path: 'unknown', component: DummyComponent },
          // Home: If your home route is empty/'' just navigating to '' will be fine
          { path: '', component: DummyComponent },
        ]),
        DummyComponent,
      ],
      providers: [
        // Provide a simple stub, NOT an empty spy object
        { provide: IdeaEventsService, useValue: {} },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);

    fixture = TestBed.createComponent(HeaderWelcome);
    component = fixture.componentInstance;
  });

  it('should create and set initial title on ngOnInit', fakeAsync(() => {
    // Initial value before ngOnInit runs
    expect(component.pageHeader).toEqual(headerConfigs.homeHeader);

    fixture.detectChanges(); // triggers ngOnInit
    tick();                  

    // After ngOnInit, initial title is set
    expect(component.pageHeader).toEqual(headerConfigs.homeHeader);
    expect(component.prevNextBtnsVisible).toBeFalse();
  }));

  it('should update pageHeader for Add Idea route', fakeAsync(() => {
    fixture.detectChanges(); // ngOnInit subscribes
    router.navigate([headerConfigs.addIdeaHeader.expected]);
    tick();
    fixture.detectChanges();

    expect(component.currentRoute).toBe('/' + headerConfigs.addIdeaHeader.expected);
    expect(component.pageHeader).toEqual(headerConfigs.addIdeaHeader as headerTitle);
    expect(component.prevNextBtnsVisible).toBeFalse();
  }));

  it('should update pageHeader for My Ideas route', fakeAsync(() => {
    fixture.detectChanges();
    router.navigate([headerConfigs.myIdeasHeader.expected]);
    tick();
    fixture.detectChanges();

    expect(component.currentRoute).toBe('/' + headerConfigs.myIdeasHeader.expected);
    expect(component.pageHeader).toEqual(headerConfigs.myIdeasHeader as headerTitle);
    expect(component.prevNextBtnsVisible).toBeFalse();
  }));

  it('should update pageHeader for Contact For Help route', fakeAsync(() => {
    fixture.detectChanges();
    router.navigate([headerConfigs.contactForHelpHeader.expected]);
    tick();
    fixture.detectChanges();

    expect(component.currentRoute).toBe('/' + headerConfigs.contactForHelpHeader.expected);
    expect(component.pageHeader).toEqual(headerConfigs.contactForHelpHeader as headerTitle);
    expect(component.prevNextBtnsVisible).toBeFalse();
  }));

  it('should update pageHeader and show prev/next buttons for View Idea route', fakeAsync(() => {
    fixture.detectChanges();
    router.navigate([headerConfigs.viewIdeaHeader.expected]);
    tick();
    fixture.detectChanges();

    expect(component.currentRoute).toBe('/' + headerConfigs.viewIdeaHeader.expected);
    expect(component.pageHeader).toEqual(headerConfigs.viewIdeaHeader as headerTitle);
    expect(component.prevNextBtnsVisible).toBeTrue();
  }));

  it('should default to homeHeader for unknown route', fakeAsync(() => {
    fixture.detectChanges();
    router.navigate(['unknown']);
    tick();
    fixture.detectChanges();

    expect(component.currentRoute).toBe('/unknown');
    expect(component.pageHeader).toEqual(headerConfigs.homeHeader as headerTitle);
    expect(component.prevNextBtnsVisible).toBeFalse();
  }));

  it('updatePageTitle should compute path and set headers correctly (direct call)', () => {
    // Directly call with each path to cover switch branches
    component.currentRoute = '/' + headerConfigs.addIdeaHeader.expected;
    component.updatePageTitle();
    expect(component.pageHeader).toEqual(headerConfigs.addIdeaHeader);
    expect(component.prevNextBtnsVisible).toBeFalse();

    component.currentRoute = '/' + headerConfigs.myIdeasHeader.expected;
    component.updatePageTitle();
    expect(component.pageHeader).toEqual(headerConfigs.myIdeasHeader);
    expect(component.prevNextBtnsVisible).toBeFalse();

    component.currentRoute = '/' + headerConfigs.contactForHelpHeader.expected;
    component.updatePageTitle();
    expect(component.pageHeader).toEqual(headerConfigs.contactForHelpHeader);
    expect(component.prevNextBtnsVisible).toBeFalse();

    component.currentRoute = '/' + headerConfigs.viewIdeaHeader.expected;
    component.updatePageTitle();
    expect(component.pageHeader).toEqual(headerConfigs.viewIdeaHeader);
    expect(component.prevNextBtnsVisible).toBeTrue();

    // Default branch
    component.currentRoute = '/non-existent';
    component.updatePageTitle();
    expect(component.pageHeader).toEqual(headerConfigs.homeHeader);
    expect(component.prevNextBtnsVisible).toBeFalse();
  });

  it('should call Location.back when goBack is invoked', () => {
    const backSpy = spyOn(location, 'back');
    component.goBack();
    expect(backSpy).toHaveBeenCalled();
  });
});
