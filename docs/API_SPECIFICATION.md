# 📡 API SPECIFICATION - Local Business Discovery Platform

## Base URL
```
Development: http://localhost:3001/api/v1
Production: https://api.yourdomain.com/api/v1
```

## Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 AUTHENTICATION ENDPOINTS

### 1. Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "phone": "+1234567890"
}

Response: 201 Created
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user"
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "user": { ... },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### 3. Firebase Login
```http
POST /auth/firebase-login
Content-Type: application/json

{
  "firebaseToken": "firebase_id_token"
}

Response: 200 OK
{
  "user": { ... },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### 4. Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token"
}

Response: 200 OK
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

---

## 👤 USER ENDPOINTS

### 1. Get Current User
```http
GET /users/me
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "role": "user",
  "avatarUrl": "https://...",
  "isEmailVerified": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 2. Update Profile
```http
PATCH /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Updated",
  "phone": "+0987654321",
  "avatarUrl": "https://..."
}

Response: 200 OK
```

### 3. Get User Favorites
```http
GET /users/me/favorites?page=1&limit=20
Authorization: Bearer <token>

Response: 200 OK
{
  "data": [ { business object } ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

---

## 🏢 BUSINESS ENDPOINTS

### 1. Search Businesses
```http
GET /businesses/search?
  query=restaurant&
  latitude=28.6139&
  longitude=77.2090&
  radius=5&
  category=uuid&
  minRating=4&
  priceRange=$$&
  page=1&
  limit=20

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "name": "Best Restaurant",
      "slug": "best-restaurant",
      "shortDescription": "...",
      "category": {
        "id": "uuid",
        "name": "Restaurants",
        "slug": "restaurants"
      },
      "address": "123 Main St",
      "city": "New Delhi",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "distance": 2.5,
      "logoUrl": "https://...",
      "averageRating": 4.5,
      "totalReviews": 120,
      "priceRange": "$$",
      "isVerified": true,
      "isFeatured": false,
      "isSponsored": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true
  }
}
```

### 2. Get Business Details
```http
GET /businesses/:slug

Response: 200 OK
{
  "id": "uuid",
  "name": "Best Restaurant",
  "slug": "best-restaurant",
  "description": "Full description...",
  "category": { ... },
  "email": "contact@restaurant.com",
  "phone": "+1234567890",
  "whatsapp": "+1234567890",
  "website": "https://...",
  "address": "123 Main St",
  "city": "New Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "logoUrl": "https://...",
  "coverImageUrl": "https://...",
  "images": ["url1", "url2"],
  "videos": ["url1"],
  "yearEstablished": 2010,
  "priceRange": "$$",
  "averageRating": 4.5,
  "totalReviews": 120,
  "totalViews": 5000,
  "businessHours": [
    {
      "dayOfWeek": "monday",
      "isOpen": true,
      "openTime": "09:00",
      "closeTime": "22:00"
    }
  ],
  "amenities": [
    { "id": "uuid", "name": "WiFi", "icon": "wifi" }
  ],
  "reviews": [ ... ],
  "isVerified": true,
  "isFeatured": false,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 3. Create Business (Vendor Only)
```http
POST /businesses
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "name": "My Business",
  "categoryId": "uuid",
  "description": "...",
  "shortDescription": "...",
  "email": "business@example.com",
  "phone": "+1234567890",
  "whatsapp": "+1234567890",
  "website": "https://...",
  "address": "123 Main St",
  "city": "New Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "logoUrl": "https://...",
  "coverImageUrl": "https://...",
  "images": ["url1", "url2"],
  "priceRange": "$$",
  "yearEstablished": 2010,
  "businessHours": [ ... ],
  "amenityIds": ["uuid1", "uuid2"]
}

Response: 201 Created
{
  "id": "uuid",
  "name": "My Business",
  "status": "pending",
  ...
}
```

### 4. Update Business (Vendor Only)
```http
PATCH /businesses/:id
Authorization: Bearer <vendor_token>
Content-Type: application/json

{ ... updated fields ... }

Response: 200 OK
```

### 5. Delete Business (Vendor Only)
```http
DELETE /businesses/:id
Authorization: Bearer <vendor_token>

Response: 204 No Content
```

---

## ⭐ REVIEW ENDPOINTS

### 1. Get Business Reviews
```http
GET /businesses/:businessId/reviews?page=1&limit=10&sort=recent

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "fullName": "John Doe",
        "avatarUrl": "https://..."
      },
      "rating": 5,
      "title": "Excellent service!",
      "comment": "...",
      "images": ["url1", "url2"],
      "helpfulCount": 15,
      "vendorResponse": "Thank you!",
      "vendorResponseAt": "2024-01-02T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": { ... }
}
```

### 2. Create Review (Authenticated User)
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "businessId": "uuid",
  "rating": 5,
  "title": "Great experience",
  "comment": "Detailed review...",
  "images": ["url1", "url2"]
}

Response: 201 Created
```

### 3. Update Review
```http
PATCH /reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated review..."
}

Response: 200 OK
```

### 4. Mark Review Helpful
```http
POST /reviews/:id/helpful
Authorization: Bearer <token>

Response: 200 OK
{
  "helpfulCount": 16
}
```

### 5. Vendor Response (Vendor Only)
```http
POST /reviews/:id/respond
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "response": "Thank you for your feedback!"
}

Response: 200 OK
```

---

## 📞 LEAD ENDPOINTS

### 1. Generate Lead
```http
POST /leads
Authorization: Bearer <token> (optional)
Content-Type: application/json

{
  "businessId": "uuid",
  "type": "call",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "I'm interested in your services"
}

Response: 201 Created
{
  "id": "uuid",
  "type": "call",
  "status": "new",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 2. Get Vendor Leads (Vendor Only)
```http
GET /leads?status=new&type=call&page=1&limit=20
Authorization: Bearer <vendor_token>

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "business": { ... },
      "user": { ... },
      "type": "call",
      "status": "new",
      "name": "John Doe",
      "phone": "+1234567890",
      "message": "...",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": { ... }
}
```

### 3. Update Lead Status (Vendor Only)
```http
PATCH /leads/:id
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "status": "contacted",
  "notes": "Called and discussed requirements"
}

Response: 200 OK
```

---

## 📁 CATEGORY ENDPOINTS

### 1. Get All Categories
```http
GET /categories?includeSubcategories=true

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "name": "Restaurants",
      "slug": "restaurants",
      "description": "...",
      "iconUrl": "https://...",
      "subcategories": [
        {
          "id": "uuid",
          "name": "Italian",
          "slug": "italian"
        }
      ]
    }
  ]
}
```

### 2. Get Category by Slug
```http
GET /categories/:slug

Response: 200 OK
{
  "id": "uuid",
  "name": "Restaurants",
  "slug": "restaurants",
  "description": "...",
  "businessCount": 1250
}
```

---

## 💳 SUBSCRIPTION ENDPOINTS

### 1. Get Subscription Plans
```http
GET /subscriptions/plans

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "name": "Premium Plan",
      "planType": "premium",
      "price": 999.00,
      "billingCycle": "monthly",
      "features": ["Feature 1", "Feature 2"],
      "maxListings": 10,
      "isFeatured": true,
      "isSponsored": true
    }
  ]
}
```

### 2. Subscribe to Plan (Vendor Only)
```http
POST /subscriptions/subscribe
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "planId": "uuid",
  "billingCycle": "monthly"
}

Response: 201 Created
{
  "subscription": { ... },
  "paymentUrl": "https://payment-gateway.com/..."
}
```

### 3. Get Current Subscription (Vendor Only)
```http
GET /subscriptions/current
Authorization: Bearer <vendor_token>

Response: 200 OK
{
  "id": "uuid",
  "plan": { ... },
  "status": "active",
  "startDate": "2024-01-01",
  "endDate": "2024-02-01",
  "autoRenew": true
}
```

### 4. Cancel Subscription (Vendor Only)
```http
POST /subscriptions/:id/cancel
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "reason": "Too expensive"
}

Response: 200 OK
```

---

## 👨‍💼 ADMIN ENDPOINTS

### 1. Get All Users (Admin Only)
```http
GET /admin/users?role=vendor&page=1&limit=20
Authorization: Bearer <admin_token>

Response: 200 OK
```

### 2. Approve/Reject Business (Admin Only)
```http
PATCH /admin/businesses/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "approved",
  "rejectionReason": ""
}

Response: 200 OK
```

### 3. Platform Analytics (Admin Only)
```http
GET /admin/analytics?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "totalUsers": 10000,
  "totalVendors": 500,
  "totalBusinesses": 1200,
  "totalReviews": 5000,
  "totalLeads": 15000,
  "revenue": 50000.00
}
```

---

## 📊 COMMON RESPONSE FORMATS

### Success Response
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasMore": true
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

---

**API Version**: 1.0.0
**Last Updated**: 2026-02-06
