import { Injectable } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Observable, Observer } from 'rxjs';

export class Redyform {
  constructor(private service: RedyformService, public model: any[], public form: FormGroup) {
  }

  get data(): any {
    return this.form.value;
  }
  set data(d: any) {
    if (!d) d = {};

    this.service.prepareForData(d, this.model, this.form);
    this.form.patchValue(d);
  }
}

export type RedyformModel = RedyformField[];

export type RedyformValidation = {
  name: 'custom',
  value: ValidatorFn
} | {
  name: 'minlength' | 'maxlength',
  value: number
} | {
  name: 'email' | 'required'
} | {
  name: 'pattern',
  value: string | RegExp
};

export interface RedyformField {
  name?: string;
  type: string;
  label?: string;
  children?: RedyformModel;
  defaultValue?: string | boolean | number | object | any[];
  required?: boolean;
  validations?: RedyformValidation[];
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class RedyformService {

  constructor() {}

  init(model: RedyformModel, value: any = {}, form: FormGroup = new FormGroup({})): Observable<Redyform> {
    return new Observable((observer: Observer<any>) => {
      try {
        this.initializeAndValidateModel(model, value);
      }
      catch (err) {
        observer.error({ message: "Invalid JSON config provided.", exception: err});
        observer.complete();
      }
      observer.next(new Redyform(this, model, this.toFormGroup(model, form)));
      observer.complete();
    });
  }

  prepareForData(data: any, model: RedyformModel, fg: AbstractControl) {
    model.forEach(f => {
      // stop if no data
      if (typeof data[f.name] === 'undefined') return;

      switch (f.type) {
        case 'array':
          let fa = fg.get(f.name) as FormArray;
          while (data[f.name].length > fa.length) {
            (f.defaultValue as any[]).push(Object.assign({}, f.children));
            fa.push(this.toFormGroupFromArr(f.children));
          }
          while (data[f.name].length < fa.length) {
            (f.defaultValue as any[]).pop();
            fa.removeAt(fa.length - 1);
          }
          // HACK fall through intentional, to run next command as well
        case 'object':
          this.prepareForData(data[f.name], f.children, fg.get(f.name));
          break;
        default:
          console.log(f.type, f.name, fg);
      }
    });
  }

  private toFormGroup(model: RedyformModel, form: FormGroup = new FormGroup({})): FormGroup {
    model.forEach(field => {
      switch (field.type) {
        case 'object':
          form.addControl(field.name, this.toFormGroupFromArr(field.children));
          break;
        default:
          form.addControl(field.name, this.appendFieldFormControlToObject(field)[field.name]);
      }
    });
    return form;
  }

  toFormGroupFromArr(arr: RedyformModel) {
    return new FormGroup(arr.reduce((acc, cur) => this.appendFieldFormControlToObject(cur, acc), {}));
  }

  private appendFieldFormControlToObject(field: RedyformField, obj: any = {}) {
    switch (field.type) {
      case 'object':
        obj[field.name] = this.toFormGroupFromArr(field.children);
        break;
      case 'array':
        obj[field.name] = new FormArray((field.defaultValue as any[]).map((el, index) => this.toFormGroupFromArr(el)));
        break;
      default:
        obj[field.name] = new FormControl(field.defaultValue, (field.validations || []).map(v => {
          switch (v.name) {
            case 'required':
              return Validators.required;
            case 'minlength':
              return Validators.minLength(v.value);
            case 'maxlength':
              return Validators.maxLength(v.value);
            case 'email':
              return Validators.email;
            case 'pattern':
              return Validators.pattern(v.value);
            case 'custom':
              return v.value;
          }
        }));
    }
    return obj;
  }

  private initializeAndValidateModel(model: RedyformModel, value: any) {
    model.forEach(field => {
      this.validateJson(field, field.name, value);
    });    
  }

  private toFormGroupFromArrForValidation(arr: RedyformModel, path: string, value: any) {
    arr.forEach(cur => {
      path = this.validateJson(cur, `${path}.${cur.name}`, value);
    }, {});
  }

  private get(path: string[], init: string) {
    return path.reduce((prev, cur) => (prev && prev[cur]) ? prev[cur] : null, init);
  }

  private validateJson(field: RedyformField, path: string, value: any) {
    if (!field.name) return;

    switch (field.type) {
      case 'object':
        this.toFormGroupFromArrForValidation(field.children, path, value);

        return path.substring(0, field.name.length + 1);
      case 'array':
        let configValuesArray = [];
        
        (this.get(path.split('.'), value) || []).forEach((rs) => {
          configValuesArray.push(field.children.map(el => Object.assign({}, el, { defaultValue: rs[el.name] })));
        });
        
        (field.defaultValue = configValuesArray).forEach((el) => this.toFormGroupFromArrForValidation(el, path, value));

        return path.replace(`.${field.name}`, '');
      default:
        field.defaultValue = this.get(path.split('.'), value) || field.defaultValue;
        field.validations = field.validations || [];
        field.required = field.validations.filter(e => e.name === 'required').length > 0;

        if (field.required) {
          if (field.validations instanceof Array) {
            if (!field.validations.find(e => e.name === 'required')) {
              field.validations.push({ name: 'required' });
            }
          }
          else {
            field.validations = [{ name: 'required' }];
          }
        }
        return path.substring(0, field.name.length + 1);
    }
  }
}
