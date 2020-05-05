import { Input, Directive } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { RedyformComponent } from "./redyform.component";

@Directive()
export class RedyformBaseComponent {
  @Input() field: any;

  @Input() redyform: RedyformComponent;

  @Input() control: AbstractControl;

  @Input() context: {
    get: (f: any, i?: number) => { field: any, control: AbstractControl },
    add: (e?: Event) => void,
    remove: (i: number, e?: MouseEvent) => void,
  };
}