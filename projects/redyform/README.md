# Redyform

Presentation agnostic, dynamic forms framework

```sh
npm install @tommy4st/redyform
```

## Prerequisite

This library is just a framework for model-driven forms. There are no actually implemented form elements in it. You have to implement them yourself using your UI framework of choice.

There are 2 field type you have to implement: `object` (for nested data) and `array` (for an array or list of data, which can be nested again).

Please see redyform-example for some help.

## How to use (simple)

```html
<redyform [model]="jsonModel" [(ngModel)]="data"></redyform>
```


## How to use (expert)

### Component
```js
redyform: Observable<Redyform>;

constructor(private redyformService: RedyformService) {}

ngOnInit() {
  this.redyform = this.redyformService.init(RedyformModel);
}
```

### Template
```html
<redyform *ngIf="redyform | async; let redy" [model]="redy.model" [form]="redy.form"></redyform>
```

## Build

Run `ng build redyform` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.