import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from 'src/app/models/User';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.css']
})
export class UserItemComponent implements OnInit {
  @Input() user !: User;
  @Output() deleteById = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  deleteUser() {
    this.deleteById.emit(this.user.id);
  }
}
