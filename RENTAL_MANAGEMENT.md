# Rental Management System

## Overview
The Rental Management System is a comprehensive admin feature that allows administrators to manage game rentals in the Game Haven platform.

## Features

### Admin Dashboard Integration
- **Sidebar Navigation**: Added "Rental Management" link in the admin sidebar, positioned under "Order Management"
- **Icon**: Uses `IconCalendarStats` from Tabler Icons to represent rental activities

### Rental Management Page
Located at `/rental-management`, this page provides:

#### Core Functionality
1. **View All Rentals**: Display all rental records in a table format
2. **Create New Rentals**: Add new rental entries for customers
3. **Edit Existing Rentals**: Modify rental details, status, and dates
4. **Delete Rentals**: Remove rental records from the system
5. **Search & Filter**: Search rentals by customer email, game title, or status

#### Rental Information Tracked
- **Customer Details**: Email address of the renter
- **Game Information**: Multiple games per rental with quantities and daily rates
- **Rental Dates**: Start date, expected return date, and actual return date
- **Duration**: Number of days rented
- **Status**: Active, Returned, Overdue, or Cancelled
- **Cost Calculation**: Automatic calculation based on daily rates and duration

#### Status Management
- **Active**: Currently rented games
- **Returned**: Successfully returned games
- **Overdue**: Games past their return date
- **Cancelled**: Cancelled rental agreements

### API Endpoints

#### GET /api/rentals
- Fetches all rental records with associated customer and game information
- Returns transformed data compatible with the frontend interface

#### POST /api/rentals
- Creates new rental records
- Supports multiple games per rental
- Validates customer existence by email

#### PUT /api/rentals
- Updates existing rental records
- Handles status changes and return date updates

#### DELETE /api/rentals
- Removes rental records from the database

### Database Integration
The system integrates with the existing `game_haven` database schema:

#### Tables Used
- **RentalRecord**: Core rental information (existing table)
- **users**: Customer information via email lookup
- **Game**: Game details and pricing for daily rate calculation

#### Data Transformation
- Daily rates are calculated as 10% of the game's purchase price
- Multiple rental records are created for quantity > 1
- Status is determined based on return dates and current date

### Frontend Components
- **Material-UI Integration**: Consistent with the existing admin dashboard design
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Automatic refresh after CRUD operations
- **Form Validation**: Ensures data integrity before submission

### Error Handling
- **API Fallback**: Shows mock data if API is unavailable
- **User Feedback**: Toast notifications for successful operations
- **Validation**: Form validation to prevent invalid data entry

## Usage

### For Administrators
1. Navigate to the admin dashboard
2. Click "Rental Management" in the sidebar
3. View existing rentals or create new ones
4. Use the search functionality to find specific rentals
5. Edit or delete rentals as needed

### For Developers
The rental management system follows the same patterns as other admin features:
- API routes in `/src/app/api/rentals/`
- Frontend page in `/src/app/(DashboardLayout)/rental-management/`
- Sidebar configuration in `/src/app/(DashboardLayout)/layout/sidebar/MenuItems.ts`

## Future Enhancements
- **Automated Overdue Detection**: Background job to mark overdue rentals
- **Email Notifications**: Automated reminders for return dates
- **Rental History**: Detailed history tracking for customers
- **Inventory Management**: Integration with game stock levels
- **Reporting**: Analytics dashboard for rental performance
