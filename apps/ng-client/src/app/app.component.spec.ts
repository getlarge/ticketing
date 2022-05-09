import { APP_BASE_HREF } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertModule } from '@ticketing/ng/alert';

import { AppComponent } from './app.component';
import { HomeComponent } from './home';
import { RootStoreModule } from './store/root-store.module';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        NgbModule,
        RootStoreModule,
        AlertModule,
        RouterModule.forRoot([
          { path: '', component: HomeComponent },
          { path: '**', redirectTo: '' },
        ]),
      ],
      declarations: [AppComponent],
      providers: [{ provide: APP_BASE_HREF, useValue: '/' }, HttpClient],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'ng-client'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('ng-client');
  });

  // it('should render title', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   const compiled = fixture.nativeElement as HTMLElement;
  //   expect(compiled.querySelector('h1')?.textContent).toContain(
  //     'Welcome angular-client'
  //   );
  // });
});
