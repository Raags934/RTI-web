import { TestBed } from "@angular/core/testing";
import { IdeaEventsService,IdeaEvent } from "./ideaServiceEvents";

fdescribe('IdeaEventsService',()=>{
    let service:IdeaEventsService;
    let receivedEvent:IdeaEvent | null;

    beforeEach(()=>{
        TestBed.configureTestingModule({});
        service=TestBed.inject(IdeaEventsService);

        //captured emitted events
        receivedEvent=null;
        service.events$.subscribe(event=>{
            receivedEvent=event;
        });
    });
    it('should be created',()=>{
        expect(service).toBeTruthy();
    });
    it('should emit applyFilter event',()=>{
        const filter={status:'Active'};
        service.applyFilter(filter);
        expect(receivedEvent).toEqual({
            type:'applyFilter',
            payload:filter
        });
    });
    it('should emit changePage event',()=>{
        service.changePage(3);
        expect(receivedEvent).toEqual({
            type:'changePage',
            payload:3
        });
    });
    it('should emit sortByColumn event',()=>{
        service.sortByColumn('name','asc');
        expect(receivedEvent).toEqual({
            type:'sortByColumn',
            payload:{column:'name',direction:'asc'}
        });
    });
    it('should emit applyFilterByStatus event',()=>{
        service.applyFilterByStatus(5);
        expect(receivedEvent).toEqual({
            type:'applyFilterByStatus',
            payload: {status_id:5}
        });
    });
    it('should emit searchByText event',()=>{
        service.searchByText('angular');
        expect(receivedEvent).toEqual({
            type:'searchByText',
            payload:{ searchText:'angular'}
        });
    });
    it('should emit resetSearch event',()=>{
        service.resetSearch();
        expect(receivedEvent).toEqual({
            type:'resetSearch'
        });
    });
    it('should emit submitIdea event',()=>{
        service.submitIdea();
        expect(receivedEvent).toEqual({
            type:'submitIdea'
        });
    });
    it('should emit saveDraft event',()=>{
        service.saveDraft();
        expect(receivedEvent).toEqual({
            type:'saveDraft'
        });
    });
    it('should emit closePopUp event',()=>{
        service.closePopUp();
        expect(receivedEvent).toEqual({
            type:'closePopUp'
        });
    });
    it('should emit cancelIdea event',()=>{
        service.cancelIdea();
        expect(receivedEvent).toEqual({
            type:'cancelIdea'
        });
    });
    it('should emit confirmPopUp event',()=>{
        service.confirmPopUp();
        expect(receivedEvent).toEqual({
            type:'confirmPopUp'
        });
    });
    it('should emit toastEvent event',()=>{
        service.toastEvent('Saved successfully');
        expect(receivedEvent).toEqual({
            type:'toastEvent',
            payload:'Saved successfully'
        });
    });
    it('should emit taFilterChange event',()=>{
        service.taFilterChange(10);
        expect(receivedEvent).toEqual({
            type:'taFilterChange',
            payload:10
        });
    });
    it('should emit franchiseFilterChange event',()=>{
        service.franchiseFilterChange(11);
        expect(receivedEvent).toEqual({
            type:'franchiseFilterChange',
            payload:11
        });
    });
});