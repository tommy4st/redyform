import { Component } from "@angular/core";
import { RedyformBaseComponent } from 'projects/redyform/src/public-api';
import { FormArray } from '@angular/forms';

@Component({
  selector: 'redyform-array',
  template: `
  <fieldset>
    <legend *ngIf="field.label">{{field.label}}</legend>
    <div *ngFor="let _noop of field.defaultValue; let i = index" style="border-bottom: 1px solid black">
      <redyform-field *ngFor="let f of field.children" [field]="context.get(f, i).field" [control]="context.get(f, i).control"></redyform-field>
      <button (click)="context.remove(i, $event)">Remove</button>
      <button [disabled]="i == field.defaultValue.length - 1" (click)="context.move(i, i + 1, $event)">Down</button>
      <button [disabled]="i == 0" (click)="context.move(i, i - 1, $event)">Up</button>
    </div>
    <button (click)="context.add($event)">Add</button>
  </fieldset>
`
})
export class RedyformArrayComponent extends RedyformBaseComponent {}

@Component({
  selector: 'redyform-object',
  template: `
  <fieldset>
    <legend *ngIf="field.label">{{ field.label }}</legend>
    <redyform-field *ngFor="let f of field.children; let i = index" [field]="f" [control]="control.get(f.name)"></redyform-field>
  </fieldset>
`
})
export class RedyformObjectComponent extends RedyformBaseComponent {}

@Component({
  selector: 'redyform-string',
  template: `
  <label *ngIf="field.label">{{ field.label }}</label>
  <input type="text" [formControl]="control" [placeholder]="field.placeholder || ''">
`,
  styles: [`
  label, input {
    display: block;
    width: 100%;
  }
  `]
})
export class RedyformStringComponent extends RedyformBaseComponent {}

@Component({
  selector: 'redyform-textarea',
  template: `
  <label *ngIf="field.label">{{ field.label }}</label>
  <textarea [formControl]="control" [placeholder]="field.placeholder || ''" [rows]="field.rows" [cols]="field.cols"></textarea>
`,
styles: [`
label, textarea {
  display: block;
  width: 100%;
}
`]
})
export class RedyformTextareaComponent extends RedyformBaseComponent {}