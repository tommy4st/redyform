import { Injectable, Compiler, Injector, ComponentFactoryResolver, ɵCodegenComponentFactoryResolver, InjectionToken, Inject, Optional } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, first } from 'rxjs/operators';
import { execFn } from './fn-helpers';
import { RedyformService } from "./redyform.service";
import { Subscription } from "rxjs";

import * as AngularCore from '@angular/core';
import * as AngularCommon from '@angular/common';
import * as AngularForms from '@angular/forms';
import * as AngularPlatformBrowser from '@angular/platform-browser';
import { ComponentType } from "@angular/cdk/portal";

export let REDYFORM_TYPE = new InjectionToken<any>('readform-type');

@Injectable({
  providedIn: 'root'
})
export class RedyformPluginService {
  
  fieldTypes: {[key: string]: { type: ComponentType<any>, resolver?: ComponentFactoryResolver} } = {};

  constructor(@Optional() @Inject(REDYFORM_TYPE) types: any[], private compiler: Compiler, private injector: Injector, private http: HttpClient, private componentFactoryResolver: ComponentFactoryResolver, private redyforms: RedyformService) {
    if (types) {
      types.forEach(type => {
        let factory = componentFactoryResolver.resolveComponentFactory(type);
        
        this.fieldTypes[factory.selector.replace(/^redyform-/,'')] = {
          type: type,
          resolver: componentFactoryResolver
        };
      })
    }
  }

  importTypesFromString(src: string, dependencies = {}) {
    const exports = {};
    const modules = Object.assign({
      '@angular/core': AngularCore,
      '@angular/common': AngularCommon,
      '@angular/forms': AngularForms,
      '@angular/platform-browser': AngularPlatformBrowser,
    }, dependencies);

    // string to actual js
    execFn(src, {
      exports: exports,
      module: true,
      require: (dep: string) => {
        if (!(dep in modules)) {
          console.log('module ' + dep + ' not found. use addToModules() to register.');
        }
        return modules[dep];
      },
      addToModules: (dep: string, mod: any) => modules[dep] = mod,
    });

    Object
    .values(exports) // take all exports
    .filter((exp: any) => exp.decorators instanceof Array && exp.decorators.find((dec: any) => dec.type.prototype.ngMetadataName === 'NgModule')) // check if export is a NgModule
    .forEach((exp: any) => {
      let compiled = this.compiler.compileModuleAndAllComponentsSync(exp);
      let module = compiled.ngModuleFactory.create(this.injector);
      let componentFactoryResolver = new ɵCodegenComponentFactoryResolver(compiled.componentFactories, this.componentFactoryResolver, module);

      compiled.componentFactories.forEach(cf => {
        this.fieldTypes[cf.selector.replace(/^redyform-/,'')] = {
          type: cf.componentType,
          resolver: componentFactoryResolver,
        }
      });
    });
  }

  importTypesFromUrl(url: string, dependencies = {}) {
    const sup: Subscription = this.http.get(url, {responseType: 'text'}).pipe(
      first(),
      map(src => this.importTypesFromString(src, dependencies))
    ).subscribe({complete: () => sup.unsubscribe()});
  }
}