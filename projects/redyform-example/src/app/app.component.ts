import { Component } from '@angular/core';
import { RedyformModel, RedyformField } from 'projects/redyform/src/public-api';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  template: `
    <!--The content below is only a placeholder and can be replaced.-->
    <div style="text-align:center" class="content">
      <h1>
        Welcome to {{title}}!
      </h1>
    </div>
    <redyform [model]="model" [(ngModel)]="data" #modelvar="ngModel"></redyform>
    <pre>{{ data | json }}</pre>
    <pre>{{ modelvar.valid }}</pre>
    <button (click)="changeModel()">drop model</button>
  `,
  styles: []
})
export class AppComponent {
  title = 'redyform-example';

  data = {
    "_hidden": "123",
    "post": {
      "title": "null",
      "content": null
    },
    "comments": [
      {
        "name": "1",
        "text": null
      },
      {
        "name": "2",
        "text": null
      },
      {
        "name": "3",
        "text": null
      }
    ]
  };

  model: RedyformModel = [
    {
      label: 'Post',
      type: 'object',
      name: 'post',
      children: [
        {
          label: 'Title',
          name: 'title',
          type: 'string',
          validations: [
            {
              kind: 'test',
              value: (ctrl: FormControl) => ctrl.value === 'test' ? {'test': {x:1}} : null,
              message: 'Error'
            }
          ]
        },
        {
          label: 'Content',
          name: 'content',
          type: 'textarea',
        }
      ]
    },
    {
      label: 'Comments',
      type: 'array',
      name: 'comments',
      children: [
        {
          label: 'Name',
          type: 'string',
          name: 'name'
        },
        {
          label: 'Comment',
          type: 'textarea',
          name: 'text'
        },
        {
          type: 'array',
          name: 'replies',
          label: 'Replies',
          children: [
            {
              type: 'textarea',
              name: 'reply',
              label: 'Reply'
            }
          ]
        }
      ]
    }
  ];

  modelBackup = [];

  changeModel() {
    let m = this.model;
    this.model = this.modelBackup;
    this.modelBackup = m;
  }
}
