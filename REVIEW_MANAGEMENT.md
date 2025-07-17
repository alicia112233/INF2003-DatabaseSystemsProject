# Review Management System

A comprehensive review management system for the Game Haven platform, allowing users to create, edit, and view reviews, while providing administrators with full management capabilities.

## Features

### User Features
- **Write Reviews**: Users can submit reviews for games they've interacted with
- **Edit Reviews**: Users can modify their existing reviews
- **View Reviews**: Browse reviews for specific games
- **My Reviews**: Dedicated page to view and manage personal reviews
- **Rating System**: 1-5 star rating system with visual feedback
- **Review Statistics**: Average ratings and review counts displayed on products

### Admin Features
- **Review Management Dashboard**: View all reviews with advanced filtering
- **Edit Reviews**: Admins can modify any review content
- **Delete Reviews**: Single or bulk deletion of inappropriate reviews
- **User Information**: View reviewer details and game information
- **Search & Filter**: Filter by rating, game, user, or search terms
- **Pagination**: Efficient handling of large review datasets

## Technical Implementation

### Backend APIs

#### Reviews API (`/api/reviews`)
- `GET` - Fetch reviews with optional filtering by gameId or userId
- `POST` - Create new review (authenticated users only)

#### Individual Review API (`/api/reviews/[id]`)
- `GET` - Fetch specific review by ID
- `PUT` - Update review (owner or admin)
- `DELETE` - Delete review (owner or admin)

#### Admin Reviews API (`/api/admin/reviews`)
- `GET` - Admin-only endpoint to fetch all reviews with user/game details
- `DELETE` - Bulk delete reviews

### Frontend Components

#### Core Components
- **ReviewComponent**: Full review interface for product pages
- **ReviewSummary**: Compact review display for product cards
- **ReviewManagement**: Admin dashboard for review management
- **MyReviews**: User dashboard for personal reviews

#### Features
- Real-time review statistics
- Responsive design
- Input validation
- Error handling
- Loading states
- Snackbar notifications

### Database Schema

#### Review Model (MongoDB)
```typescript
{
  userId: String (required),
  gameId: String (required),
  rating: Number (1-5, required),
  comment: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

#### Unique Constraints
- One review per user per game (compound index: userId + gameId)

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── reviews/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── admin/
│   │       └── reviews/
│   │           └── route.ts
│   ├── (DashboardLayout)/
│   │   └── review-management/
│   │       └── page.tsx
│   ├── my-reviews/
│   │   └── page.tsx
│   └── product/
│       └── [id]/
│           └── page.tsx
├── components/
│   └── reviews/
│       ├── ReviewComponent.tsx
│       └── ReviewSummary.tsx
└── models/
    └── Review.ts
```

## Navigation Integration

### Admin Navigation
- Added "Review Management" to admin sidebar
- Accessible at `/review-management`

### User Navigation
- Added "My Reviews" to customer sidebar and profile menu
- Accessible at `/my-reviews`

### Product Integration
- Review summary displayed on product cards
- Full review component on product detail pages
- Clickable product cards navigate to detail pages

## Authentication & Authorization

### User Authentication
- Cookie-based authentication
- User ID extraction from cookies
- Role-based access control

### Permissions
- **Users**: Can create, edit, and delete their own reviews
- **Admins**: Can view, edit, and delete all reviews
- **Guests**: Can view reviews but cannot create them

## Usage Examples

### Creating a Review
```typescript
// User submits review
POST /api/reviews
{
  gameId: "123",
  rating: 5,
  comment: "Great game!"
}
```

### Fetching Game Reviews
```typescript
// Get all reviews for a specific game
GET /api/reviews?gameId=123
```

### Admin Review Management
```typescript
// Get all reviews with user/game details
GET /api/admin/reviews?page=1&limit=10

// Bulk delete reviews
DELETE /api/admin/reviews
{
  reviewIds: ["review1", "review2"]
}
```

## Error Handling

- Validation errors for required fields
- Authentication errors for unauthorized access
- Database connection error handling
- User-friendly error messages
- Proper HTTP status codes

## Performance Considerations

- Pagination for large datasets
- Efficient database queries
- Caching for review summaries
- Optimized MongoDB indexes
- Lazy loading for review components

## Security Features

- Input sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting (recommended)
- Content validation

## Future Enhancements

- Review moderation system
- Review voting/helpful system
- Image attachments for reviews
- Review response system
- Advanced analytics
- Email notifications
- Review verification system
