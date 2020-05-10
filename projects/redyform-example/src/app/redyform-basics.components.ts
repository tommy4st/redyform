import { Component } from "@angular/core";
import { RedyformBaseComponent } from 'projects/redyform/src/public-api';
import { FormArray, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'redyform-array',
  template: `
  <fieldset>
    <legend *ngIf="field.label">{{field.label}}</legend>
    <div *ngFor="let ctrl of control.controls; index as i" style="border-bottom: 1px solid black">
      <div>
        <redyform-field *ngFor="let f of field.children" [control]="ctrl.controls[f.name]"></redyform-field>
      </div>
    </div>
    <button (click)="context.add($event)">Add</button>
  </fieldset>
`
})
export class RedyformArrayComponent extends RedyformBaseComponent<FormArray> {
}

@Component({
  selector: 'redyform-object',
  template: `
  <fieldset>
    <legend *ngIf="field.label">{{ field.label }}</legend>
    <redyform-field *ngFor="let f of field.children; let i = index" [control]="control.controls[f.name]"></redyform-field>
  </fieldset>
`
})
export class RedyformObjectComponent extends RedyformBaseComponent<FormGroup> {}

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
export class RedyformStringComponent extends RedyformBaseComponent<FormControl> {}

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
export class RedyformTextareaComponent extends RedyformBaseComponent<FormControl> {}