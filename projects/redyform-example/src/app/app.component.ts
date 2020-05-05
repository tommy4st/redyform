import { Component } from '@angular/core';
import { RedyformModel } from 'projects/redyform/src/public-api';

@Component({
  selector: 'app-root',
  template: `
    <!--The content below is only a placeholder and can be replaced.-->
    <div style="text-align:center" class="content">
      <h1>
        Welcome to {{title}}!
      </h1>
    </div>
    <redyform [model]="model" [(ngModel)]="data"></redyform>
    <pre>{{ data | json }}</pre>
  `,
  styles: []
})
export class AppComponent {
  title = 'redyform-example';

  data = {
    comments: []
  };

  model: RedyformModel = [
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
        }
      ]
    }
  ];
}
