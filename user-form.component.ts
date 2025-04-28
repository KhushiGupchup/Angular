import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  users: any[] = [];
  editIndex: number | null = null;

  displayedColumns: string[] = ['name', 'username', 'email', 'phone', 'website', 'city', 'company', 'actions'];

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\s\(\)]+$/)]],
      website: ['', Validators.required],
      address: this.fb.group({
        city: ['', Validators.required]
      }),
      company: this.fb.group({
        name: ['', Validators.required]
      })
    });

    this.loadUsers();
  }

  get cityControl(): FormControl {
    return this.userForm.get('address.city') as FormControl;
  }

  get companyNameControl(): FormControl {
    return this.userForm.get('company.name') as FormControl;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      // If the form is invalid, mark all fields as touched so that validation errors are shown
      this.userForm.markAllAsTouched();
      return;
    }
  
    const newUser = this.userForm.value;
    const enrichedUser = {
      ...newUser,
      id: this.editIndex !== null ? this.users[this.editIndex].id : this.users.length + 1
    };
  
    if (this.editIndex !== null) {
      this.users[this.editIndex] = enrichedUser;
      this.editIndex = null;
    } else {
      this.users.unshift(enrichedUser);
    }
  
    this.users = [...this.users]; // Refresh table
  
    // Reset form values after submission
    this.userForm.reset({
      address: { city: '' },
      company: { name: '' }
    });
  
    // Mark the form as untouched and pristine after reset to remove red outline
    this.userForm.markAsUntouched(); // Clear validation state
    this.userForm.markAsPristine();  // Prevent accidental form submission
  }
  
  onEdit(user: any, index: number): void {
    this.editIndex = index;

    this.userForm.patchValue({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      website: user.website,
      address: { city: user.address?.city || '' },
      company: { name: user.company?.name || '' }
    });
  }

  onDelete(index: number): void {
    this.users.splice(index, 1);
    this.users = [...this.users]; // Refresh table
    this.editIndex = null;
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(data => {
      this.users = data;
    });
  }
}
