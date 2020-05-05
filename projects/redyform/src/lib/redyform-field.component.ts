import { Component, Input, ChangeDetectorRef, EventEmitter, Injector, ViewChild, Optional, HostBinding } from '@angular/core';
import { AbstractControl, FormArray } from '@angular/forms';
import { RedyformService } from './redyform.service';
import { of, Observable } from 'rxjs';
import { debounceTime, tap, switchMap, map, catchError, publishReplay, refCount } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { compileFn } from './fn-helpers';
import { RedyformComponent } from './redyform.component';
import { ComponentPortal, CdkPortalOutlet } from '@angular/cdk/portal';
import { RedyformPluginService } from './redyform-plugin.service';

@Component({
  selector: 'redyform-field',
  templateUrl: './redyform-field.component.html',
})
export class RedyformFieldComponent {

  @Input() control: AbstractControl;
  @Input()
  get field(): any {
    return this._field || {};
  }
  set field(f: any) {
    f._meta = {};

    this._meta = f._meta;
    this._field = f;

    this.prepareItems();

    if (f.onSelectFn) {
      const onSelect = compileFn(f.onSelectFn, ['item', 'control', 'http', 'redyform']);
      this._meta.onSelect = ($event) => onSelect.call(this, $event, this.control, this.http, this.redyform);
    }
    else {
      this._meta.onSelect = () => {};
    }

    this.cdr.detectChanges();
  }

  @HostBinding('style.width')
  get fieldWidth() {
    let w = this.field.width;
    return isNaN(w) ? w : (w / 12 * 100) + '%';
  }

  _field: any;

  _meta: any;

  @ViewChild(CdkPortalOutlet) portalOutlet: CdkPortalOutlet;

  constructor(@Optional() public redyform: RedyformComponent, public redyformService: RedyformService, private cdr: ChangeDetectorRef, private http: HttpClient, private injector: Injector, private redyformPlugins: RedyformPluginService) { }

  ngAfterViewInit() {
    setTimeout(() => {
      const type = this.field.type;

      /*if (['array','object'].includes(type)) {
        // ignore
      }
      else // */ if (type in this.redyformPlugins.fieldTypes) {
        let f = this.redyformPlugins.fieldTypes[type];
        let portal = new ComponentPortal(f.type, undefined, this.injector, f.resolver);
        Object.assign(portal.attach(this.portalOutlet).instance, {
          field: this.field,
          control: this.control,
          redyform: this.redyform,
          context: {
            get: (f, i?) => this.getContext(f, i),
            add: (e?) => this.addField(e),
            remove: (i, e?) => this.removeField(i, e),
          },
        });
      }
      else {
        console.error('missing redyform type: ' + type);
      }
    });
  }

  getContext(f: any, i?: number) : { field: any, control: AbstractControl } {
    if(this.field.type ===  "array") {
      let fa: FormArray = this.control as FormArray;
      for (let j = fa.length; j <= i; j++) {
        fa.push(this.redyformService.toFormGroupFromArr(this.field.children));
      }
      return {'field': f, 'control': fa.at(i).get(f.name)};
    }
    else {
      return {'field': f, 'control': this.control};
    }
  }

  addField(e?: Event): void {
    e && e.preventDefault();
    this.field.defaultValue.push(this.field.children);
    (this.control as FormArray).push(this.redyformService.toFormGroupFromArr(this.field.children));
  }

  removeField(i: number, e?: MouseEvent): void {
    e && e.preventDefault();
    this.field.defaultValue.splice(i, 1);
    (this.control as FormArray).removeAt(i);
  }

  prepareItems(): Observable<any> {
    const items = this.field.items;

    if (items instanceof Array) {
      this._meta.items = of(items);
    }
    else if (typeof items === 'object') {
      let out: Observable<any>;

      if ('request' in items) {
        const req = items.request;

        let trigger: Observable<any> = this._meta.trigger = items.trigger || new EventEmitter();
        
        if (!req.params) {
          req.params = {};
        }

        out = (req.q ? trigger : of('')).pipe(
          debounceTime(req.debounce || 500),
          tap(() => this._meta.itemsLoading = true),
          switchMap(i => {
            if (req.q) {
              req.params[req.q] = i;
            }
            return this.http.get<any[]>(req.url + (req.q ? '' : i), {headers: req.headers || [], params: req.params} )
              .pipe(
                map(r => {
                  if (req.select) {
                    let s = req.select.split('[./]');
                    for (let i = 0; i < s.length; i++) {
                      r = r[s[i]];
                    }
                  }
                  return r;
                })
              );
          }),
          catchError(() => of([])),
          tap(() => this._meta.itemsLoading = false),
        );
      }
      else if ('items' in items && items.items instanceof Array) {
        out = of(items.items);
      }
      else {
        console.error('no valid item source found', this.field);
        out = of();
      }

      if ('mapping' in items) {
        this._meta.mapFn = compileFn(items.mapping, ['item','index','items'], true);
      }

      out = out.pipe(
        publishReplay(1),
        refCount()
      )

      return this._meta.items = out;
    }
  }
}