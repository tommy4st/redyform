import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RedyformModule, REDYFORM_TYPE } from 'projects/redyform/src/public-api';
import { RedyformStringComponent, RedyformTextareaComponent, RedyformArrayComponent, RedyformObjectComponent } from './redyform-basics.components';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

const REDYFORM_COMPONENTS = [
  RedyformStringComponent,
  RedyformTextareaComponent,
  RedyformArrayComponent,
  RedyformObjectComponent,
];

@NgModule({
  declarations: [
    AppComponent,
    ...REDYFORM_COMPONENTS,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RedyformModule,
  ],
  providers: [
    ...REDYFORM_COMPONENTS.map(component => ({
      provide: REDYFORM_TYPE,
      useValue: component,
      multi: true,
    }))
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
