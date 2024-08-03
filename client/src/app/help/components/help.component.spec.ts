import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HelpComponent } from './help.component';
import { Component } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

// Mock components
@Component({ selector: 'app-toolbar', template: '' })
class MockToolbarComponent { }

@Component({ selector: 'app-navbar', template: '' })
class MockNavbarComponent { }

@Component({ selector: 'app-footer', template: '' })
class MockFooterComponent { }

describe('HelpComponent', () => {
    let component: HelpComponent;
    let fixture: ComponentFixture<HelpComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ RouterTestingModule ], 
            declarations: [
                HelpComponent,
                MockToolbarComponent,
                MockNavbarComponent,
                MockFooterComponent,
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HelpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('scrollTo', () => {
        it('should call scrollIntoView on the element with the given id', () => {
            const mockElement = {
                scrollIntoView: jasmine.createSpy('scrollIntoView')
            };
            spyOn(document, 'getElementById').and.returnValue(mockElement as any);

            component.scrollTo('testElement');

            expect(document.getElementById).toHaveBeenCalledWith('testElement');
            expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
        });

        it('should not throw an error if the element is not found', () => {
            spyOn(document, 'getElementById').and.returnValue(null);

            expect(() => component.scrollTo('nonExistentElement')).not.toThrow();
        });
    });
});