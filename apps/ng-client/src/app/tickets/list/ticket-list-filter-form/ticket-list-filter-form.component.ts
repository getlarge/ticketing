import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { User } from '@ticketing/shared/models';
import { Subscription } from 'rxjs';

import { TicketFilter } from '../../../models';

@Component({
  selector: 'ticketing-ticket-list-filter-form',
  templateUrl: './ticket-list-filter-form.component.html',
  styleUrls: ['./ticket-list-filter-form.component.css'],
})
export class TicketListFilterFormComponent implements OnInit, OnDestroy {
  @Input() currentFilter!: TicketFilter;
  @Input() users!: User[];
  @Output() filter = new EventEmitter<TicketFilter>();

  form!: FormGroup;
  formValue!: TicketFilter;
  formValueSub!: Subscription;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      price: [null],
      title: [null],
      userId: [null],
    });
    this.formValueSub = this.form.valueChanges.subscribe((value) => {
      const updatedFilter: TicketFilter = {
        ...value,
        price:
          value.price != null && value.price !== ''
            ? parseInt(value.price, 10)
            : null,
        userId:
          value.userId != null && value.userId !== '' ? value.userId : null,
        title: value.title != null && value.title !== '' ? value.title : null,
      };
      this.formValue = updatedFilter;
    });
    this.form.setValue({
      price: null,
      title: null,
      userId: null,
    });
  }

  updateFilter(): void {
    this.filter.emit({ ...this.formValue });
  }

  ngOnDestroy(): void {
    this.formValueSub?.unsubscribe();
  }
}
