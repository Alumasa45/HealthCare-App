# Healthcare App - Dual Registration Architecture

## Overview

This document explains the two-step registration process implemented in the healthcare application to maintain data integrity and role-based access control.

## Architecture Rationale

### Why Two-Step Registration?

1. **Separation of Concerns**: Basic user information (authentication) is separate from role-specific data (professional details)
2. **Scalability**: Easy to add new user types without modifying core user structure
3. **Security**: Different access levels for different user types
4. **Data Integrity**: Ensures all professional users have corresponding user accounts

## Registration Flows

### 1. Patient Registration (Self-Service)

**Step 1: User Account Creation**

- Patient visits signup page
- Creates basic user account (users table)
- User_Type = "Patient"

**Step 2: Patient Profile Creation**

- Automatically redirected to patient profile form
- Creates patient-specific record (patients table)
- Links to user account via User_id foreign key

### 2. Doctor Registration (Admin-Only)

**Step 1: Admin Creates User Account**

- Admin logs into admin dashboard
- Creates user account with User_Type = "Doctor"
- Generates temporary password

**Step 2: Admin Creates Doctor Profile**

- Admin selects from available doctor users
- Creates doctor-specific record (doctors table)
- Links to user account via User_id foreign key

### 3. Pharmacist Registration (Admin-Only)

**Step 1: Admin Creates User Account**

- Admin logs into admin dashboard
- Creates user account with User_Type = "Pharmacist"
- Generates temporary password

**Step 2: Admin Creates Pharmacist Profile**

- Admin selects from available pharmacist users
- Creates pharmacist-specific record (pharmacies table)
- Links to user account via User_id foreign key

## Database Schema Relationships

```
users (base table)
├── User_id (PK)
├── First_Name
├── Last_Name
├── Email
├── Password
├── User_Type (Patient, Doctor, Pharmacist, Admin)
└── ... (common fields)

patients (role-specific)
├── Patient_id (PK)
├── User_id (FK → users.User_id)
├── Blood_Group
├── Emergency_Contact_Name
└── ... (patient-specific fields)

doctors (role-specific)
├── Doctor_id (PK)
├── User_id (FK → users.User_id)
├── License_number
├── Specialization
└── ... (doctor-specific fields)

pharmacies (role-specific)
├── Pharmacy_id (PK)
├── User_id (FK → users.User_id)
├── Pharmacy_Name
├── License_Number
└── ... (pharmacy-specific fields)
```

## Admin Dashboard Features

### Professional Registration

1. **User Creation Form**: Create basic user accounts
2. **Doctor Registration**: Link users to doctor profiles
3. **Pharmacist Registration**: Link users to pharmacy profiles
4. **Smart Filtering**: Only show users without existing professional profiles

### System Overview

1. **User Management**: View all registered users
2. **Professional Monitoring**: Track doctors and pharmacists
3. **Patient Overview**: Monitor patient registrations
4. **Activity Logs**: System activity tracking

## Implementation Benefits

1. **Role-Based Security**: Clear separation of user types
2. **Admin Control**: Doctors and pharmacists must be approved by admin
3. **Data Consistency**: All professionals have corresponding user accounts
4. **Scalable Architecture**: Easy to add new user types (nurses, technicians, etc.)
5. **Audit Trail**: Clear tracking of who created what and when

## Authentication Flow

### Login Process

1. User enters credentials (email/password or license number)
2. System checks user type
3. Redirects to appropriate dashboard based on User_Type
4. Loads role-specific data using User_id relationship

### Dashboard Routing

- **Admin**: AdminDashboard - Full system management
- **Doctor**: DoctorDashboard - Patient management, appointments
- **Pharmacist**: PharmacistDashboard - Inventory, orders
- **Patient**: PatientDashboard - Appointments, records

## Security Considerations

1. **Admin-Only Professional Registration**: Prevents unauthorized doctor/pharmacist accounts
2. **Role-Based Navigation**: Users only see relevant features
3. **Data Isolation**: Role-specific data is properly separated
4. **Audit Logging**: Track all registration activities

## Future Enhancements

1. **Approval Workflow**: Multi-step approval for professional registrations
2. **Verification System**: Document upload and verification for licenses
3. **Notification System**: Email notifications for new registrations
4. **Reporting Dashboard**: Analytics on user registrations and activity
5. **Bulk Registration**: Import multiple professionals from CSV/Excel

This architecture ensures a robust, scalable, and secure user management system suitable for a healthcare environment.
