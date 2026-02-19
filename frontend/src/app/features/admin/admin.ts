import { Component } from '@angular/core';
import { TagManagerComponent } from '../tags/tag-manager';
import { TypeManagerComponent } from '../types/type-manager';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [TagManagerComponent, TypeManagerComponent],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent {}
