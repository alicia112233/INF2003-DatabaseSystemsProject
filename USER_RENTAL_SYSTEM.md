# User Rental System

## Overview
The User Rental System allows customers to rent games for a specified period at a daily rate of **25% (quarter)** of the game's purchase price.

## Features

### For Users

#### Product Browsing with Rental Options
- **Rent Button**: Each game card now includes a "Rent Game" button alongside the "Add to Cart" button
- **Daily Rate Display**: Shows the rental cost per day (25% of purchase price)
- **Rental Dialog**: Interactive dialog to select rental duration (1-30 days)
- **Cost Calculator**: Real-time calculation of total rental cost

#### My Rentals Page (`/my-rentals`)
- **Rental History**: View all current and past rentals
- **Status Tracking**: Active, Returned, Overdue status indicators
- **Return Functionality**: Easy one-click game return
- **Overdue Alerts**: Visual warnings for overdue rentals

#### Rental Process
1. Browse games on the products page
2. Click "Rent Game" button on any available game
3. Select rental duration (1-30 days)
4. Confirm rental with cost summary
5. Game is automatically removed from available stock
6. Return game anytime from "My Rentals" page

### Navigation Integration
- **My Rentals** link added to user sidebar under "MY ACCOUNT" section
- Easy access alongside "My Orders"

## API Endpoints

### Consolidated Rental API Structure
All rental-related endpoints are now organized under `/api/rentals/` for better organization:

#### Admin Rental Management
- **GET `/api/rentals`**: Admin view of all rentals
- **POST `/api/rentals`**: Admin create rental
- **PUT `/api/rentals`**: Admin update rental
- **DELETE `/api/rentals`**: Admin delete rental

#### User Rental Management
- **GET `/api/rentals/user`**: Fetch current user's rental history
- **POST `/api/rentals/user`**: Create new rental for authenticated user

#### Rental Operations
- **POST `/api/rentals/return`**: Return a rented game
- **POST `/api/rentals/quick-rent`**: Direct rental creation (admin/future use)

## Pricing Structure

### Daily Rental Rate Calculation
- **Formula**: Game Price × 0.25 (25%)
- **Example**: $60 game = $15/day rental rate
- **Minimum**: 1 day rental
- **Maximum**: 30 days rental

### Cost Examples
| Game Price | Daily Rate | 3 Days | 7 Days | 14 Days |
|------------|------------|--------|--------|---------|
| $20.00     | $5.00      | $15.00 | $35.00 | $70.00  |
| $40.00     | $10.00     | $30.00 | $70.00 | $140.00 |
| $60.00     | $15.00     | $45.00 | $105.00| $210.00 |

## Database Integration

### Tables Used
- **RentalRecord**: Stores rental information
  - `user_id`: Links to users table
  - `game_id`: Links to Game table
  - `depart_date`: Rental start date
  - `return_date`: Expected return date
  - `duration`: Number of days rented
  - `returned`: Boolean flag for return status

- **Game**: Updated for stock management
  - `stock_count`: Reduced by 1 when rented, increased by 1 when returned

- **users**: User authentication and identification

### Status Logic
- **Active**: `returned = FALSE` and current date ≤ return date
- **Overdue**: `returned = FALSE` and current date > return date
- **Returned**: `returned = TRUE`

## UI Components

### RentButton Component
- **Location**: `/src/components/products/RentButton.tsx`
- **Features**: 
  - Rental duration selection
  - Cost calculation display
  - Return date preview
  - Loading states and error handling

### ProductCard Updates
- **Enhanced**: Added RentButton alongside existing AddToCartButton
- **Conditional Display**: Only shows rent option for in-stock games
- **Styling**: Green accent color to distinguish from purchase options

### My Rentals Page
- **Location**: `/src/app/my-rentals/page.tsx`
- **Features**:
  - Tabular rental history display
  - Game thumbnails and details
  - Status chips with color coding
  - Return game functionality
  - Overdue warnings

## User Experience Flow

### Rental Process
1. **Discovery**: User browses games and sees both "Add to Cart" and "Rent Game" options
2. **Selection**: User clicks "Rent Game" and sees rental dialog
3. **Configuration**: User selects rental duration and sees cost breakdown
4. **Confirmation**: User confirms rental and receives success notification
5. **Management**: User can view and manage rentals in "My Rentals" section
6. **Return**: User returns game when finished, stock is automatically restored

### Authentication Requirements
- Users must be logged in to rent games
- Session management via cookies
- Rental history tied to user account

## Error Handling
- **Authentication**: Redirects to login if not authenticated
- **Stock Validation**: Prevents rental of out-of-stock games
- **User Validation**: Ensures valid user account exists
- **Rental Validation**: Prevents duplicate rentals, validates return permissions
- **Graceful Degradation**: Shows mock data if API unavailable

## Future Enhancements
- **Payment Integration**: Process rental payments
- **Automatic Returns**: Schedule automatic returns when rental period expires
- **Late Fees**: Calculate and charge late fees for overdue rentals
- **Rental Extensions**: Allow users to extend rental periods
- **Wishlist Integration**: Rent games from wishlist
- **Push Notifications**: Remind users of upcoming return dates
- **Rental Recommendations**: Suggest games based on rental history
