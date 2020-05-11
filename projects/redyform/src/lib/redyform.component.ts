import { Component, Input, ChangeDetectorRef, EventEmitter, forwardRef, Output, OnInit, OnDestroy, ViewContainerRef, ComponentRef, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray, NG_VALUE_ACCESSOR, FormGroup, ValidatorFn, Validators, FormControl, ControlValueAccessor, AbstractControl } from '@angular/forms';
import { RedyformPluginService } from './redyform-plugin.service';

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

export class RedyformBaseComponent<T extends FormGroup | FormArray | FormControl> {
  field: RedyformField;

  control: T;

  redyfield: RedyformField;

  redyform: RedyformComponent;

  context: {
    add: (e?: Event) => void,
    move: (from: number, to: number, e: Event) => void,
    remove: (i: number, e?: MouseEvent) => void,
  };
}

@Component({
  selector: 'redyform-field',
  template: ``,
})
export class RedyformFieldComponent implements OnDestroy, OnInit, OnChanges {
  @Input()
  control: AbstractControl;

  get field(): RedyformField {
    return this.control ? (this.control as any)._field : { type: 'undefined' };
  }

  private component: ComponentRef<RedyformBaseComponent<any>>;

  ngOnDestroy: ()=>void;

  constructor(private root: RedyformComponent, private redyformPlugins: RedyformPluginService, private container: ViewContainerRef) {
  }

  private populateComponent(control: any) {
    if (!this.component) return;

    Object.assign(this.component.instance, {
      control,
      field: control._field,
      redyfield: this,
      redyform: this.root,
      context: {
        add: () => {
          (control as FormArray).push(this.root.childrenToFormGroup(control._field, {}));
        },
        remove: (i) => (control as FormArray).removeAt(i),
        move: (from, to) => {
          let fa = control as FormArray;
          let fc = fa.at(from);
          fa.removeAt(from);
          fa.insert(to, fc);
        }
      }    
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.populateComponent(this.control = changes.control.currentValue);
  }

  ngOnInit() {
    if (this.field.type in this.redyformPlugins.fieldTypes) {
      const field = this.redyformPlugins.fieldTypes[this.field.type];
      const factory = field.resolver.resolveComponentFactory<RedyformBaseComponent<any>>(field.type);

      this.component = this.container.createComponent(factory);

      this.ngOnDestroy = this.component.destroy;

      this.populateComponent(this.control);
    }
    else {
      console.error('missing redyform type: ' + this.field.type);
    }
  }
}

@Component({
  selector: 'redyform',
  template: `
<form [formGroup]="form" class="redyform-group">
  <redyform-field *ngFor="let field of model" [control]="form.controls[field.name]"></redyform-field>
</form>
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RedyformComponent), multi: true },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedyformComponent implements ControlValueAccessor, OnInit {

  private _model: RedyformModel;

  @Input()
  get model(): RedyformModel {
    return this._model || [];
  }
  set model(model: RedyformModel) {
    this._model = model;
    if (this._form) {
      this.prepareModel(this.value);
    }
  }

  private _form: FormGroup;

  @Input()
  get form(): FormGroup {
    return this._form;
  }
  set form(f: FormGroup) {
    this._form = f;
    if (this._model) {
      this.prepareModel(JSON.parse(JSON.stringify(f.value)));
    }
    f.valueChanges.subscribe(next => this.valueChanges.emit(next));
  }

  get value(): any {
    return this._form.value;
  }
  set value(value: any) {
    if (value) {
      this.prepareModel(value);
    }
  }

  @Output()
  valueChanges = new EventEmitter();

  private prepareModel(value: any) {
    let model = this.model;
    let form = this.form;

    model.forEach(field => form.get(field.name) ?
      form.setControl(field.name, this.prepareField(field, value[field.name])) :
      form.addControl(field.name, this.prepareField(field, value[field.name]))
    );

    this.cdr.markForCheck();
  }

  private prepareField(field: RedyformField, value: any): FormGroup | FormArray | FormControl {
    // connot prepare without field model
    if (!field) return;

    let ctrl: any;

    if (Array.isArray(field.children)) {
      if (field.type.endsWith('array')) {
        // array
        ctrl = new FormArray((Array.isArray(value) ? value : []).map((v, i) => this.childrenToFormGroup(field, v)));
      }
      else {
        // object
        ctrl = this.childrenToFormGroup(field, value);
      }
    }
    else {
      ctrl = new FormControl(typeof value !== 'undefined' ? value : field.defaultValue, this.buildValidators(field));
    }

    ctrl._field = field;
    return ctrl;
  }

  childrenToFormGroup(field: RedyformField, value: any) {
    return new FormGroup(field.children.reduce((map, child) => {
      map[child.name] = this.prepareField(child, typeof value !== 'undefined' ? value[child.name] : undefined);
      return map;
    }, {}));
  }

  private buildValidators(field: RedyformField): ValidatorFn[] {
    return (field.validations || []).map(v => {
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
    });
  }

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.form = new FormGroup({});
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    //throw new Error("Method not implemented.");
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.form.disable() : this.form.enable();
  }
}