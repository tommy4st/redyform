# Redyform

Presentation agnostic, dynamic forms framework for Angular

```sh
npm install @tommy4st/redyform
```

## Prerequisite

This library is just a framework for model-driven forms. There are no actually implemented form elements in it. You have to implement them yourself using your UI framework of choice.

There is a special kind of fields, which name ends in "array". They are always treated as a collection type.

Please see [redyform-example](https://github.com/tommy4st/redyform/tree/master/projects/redyform-example/src) for some help and a some [basic field definitions](https://github.com/tommy4st/redyform/blob/master/projects/redyform-example/src/app/redyform-basics.components.ts).

## How to use

TS:
```js
jsonModel: RedyformModel = [
  {
    type: 'string',
    name: 'name',
    label: 'Your Name'
  },
  {
    type: 'array',
    name: 'comments',
    children: [
      {
        type: 'textarea',
        name: 'comment',
        label: 'Yout Comment'
      }
    ]
  }
];

data: any;
```

HTML:
```html
<redyform [model]="jsonModel" [(ngModel)]="data"></redyform>
```

## Build

Run `ng build redyform` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.