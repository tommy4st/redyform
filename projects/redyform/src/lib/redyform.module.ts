import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { RedyformPluginService } from './redyform-plugin.service';
import { JitCompilerFactory } from '@angular/platform-browser-dynamic';
import { RedyformComponent, RedyformFieldComponent } from './redyform.component';

export function createJitCompiler () {
  return new JitCompilerFactory().createCompiler([{useJit: true}]);
}

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
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
    RedyformPluginService,
    //{ provide: Compiler, useFactory:  createJitCompiler},
  ]
})
export class RedyformModule { }