import { Component, Input, forwardRef, Output, EventEmitter, OnDestroy, ElementRef, OnInit } from '@angular/core';
import { FormGroup, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RedyformService, Redyform, RedyformModel } from './redyform.service';

@Component({
  selector: 'redyform',
  templateUrl: 'redyform.component.html',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RedyformComponent), multi: true }
  ]
})
export class RedyformComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Output() valueChanges = new EventEmitter();
  
  private _model: RedyformModel = [];
  @Input()
  set model(value: RedyformModel) {
    this._model = value;
    this.ngOnInit();
  }
  get model(): RedyformModel {
    return this._model;
  }

  private _form: FormGroup = new FormGroup({});
  @Input()
  set form(value: FormGroup) {
    this._form = value;
    this.ngOnInit();
  }
  get form(): FormGroup {
    return this._form;
  }

  private unsub: Subscription[] = [];

  get element() {
    return this.elRef.nativeElement;
  }

  redyform: Redyform = new Redyform(undefined, [], this.form);

  constructor(private redyformService: RedyformService, private elRef: ElementRef) {}

  ngOnInit() {
    this.unsub.push(this.redyformService.init(this.model, this.redyform ? this.redyform.data : {}, this.form).subscribe(re => {
      this.unsub.push(re.form.valueChanges.subscribe(next => this.valueChanges.emit(next)));
      this.redyform = re;
    }));
  }

  ngOnDestroy() {
    this.unsub.forEach(u => u.unsubscribe());
    this.unsub = [];
  }

  writeValue(obj: any): void {
    this.redyform.data = obj;
  }

  registerOnChange(fn: any): void {
    this.unsub.push(this.valueChanges.subscribe(fn));
  }

  registerOnTouched(fn: any): void {
    //throw new Error("Method not implemented.");
  }
}
 