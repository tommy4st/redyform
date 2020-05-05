import { NgModule, Compiler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { RedyformComponent } from './redyform.component';
import { RedyformFieldComponent } from './redyform-field.component';
import { RedyformService } from './redyform.service';

import { PortalModule } from '@angular/cdk/portal'; 

import { RedyformPluginService } from './redyform-plugin.service';
import { JitCompilerFactory } from '@angular/platform-browser-dynamic';

export function createJitCompiler () {
  return new JitCompilerFactory().createCompiler([{useJit: true}]);
}

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    PortalModule,
  ],
  declarations: [
    RedyformComponent,
    RedyformFieldComponent,
  ],
  exports: [
    RedyformComponent,
    RedyformFieldComponent,
  ],
  providers: [
    RedyformService,
    RedyformPluginService,
    //{ provide: Compiler, useFactory:  createJitCompiler},
  ]
})
export class RedyformModule { }