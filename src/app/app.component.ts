import { Component, signal } from '@angular/core';
import { NxWelcomeComponent } from './nx-welcome.component';
import { mutation, query } from '@ng-query/ng-query';
import { of, timer } from 'rxjs';

@Component({
  standalone: true,
  imports: [NxWelcomeComponent],
  selector: 'ng-query-root',
  template: `
    <div>Query: {{ someQ.state().status }}</div>
    <div>Mutation: {{ someM.state().status }}</div>
    <button type="button" (click)="someM.mutate(3)">Do</button>
  `,
})
export class AppComponent {
  title = 'ng-query';
  someQ = query(signal(['test']), () => timer(3000));
  someM = mutation((a: number) => timer(3000));
}
