# Player Management API Documentation

This documentation covers the implementation of Player Add and Get APIs for frontend integration with the gym management system.

## Authentication Required
All player management endpoints require gym owner authentication using Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Player Add API

### Endpoint: `POST /api/admin/players`

Creates a new gym player with subscription details.

### Required Request Headers
```
Content-Type: application/json
Authorization: Bearer <gym_owner_token>
```

### Required Data Model
```json
{
  "name": "John Doe",
  "email": "john.doe@email.com", 
  "phone": "9876543210",
  "gymId": "60f7b3b3b3b3b3b3b3b3b3b4",
  "subscriptionId": "60f7b3b3b3b3b3b3b3b3b3b5"
}
```

### Optional Data Fields
```json
{
  "age": 25,
  "gender": "male",
  "dob": "1998-05-15",
  "password": "customPassword123",
  "line1": "123 Main Street",
  "city": "Mumbai",
  "district": "Mumbai",
  "state": "Maharashtra", 
  "country": "India",
  "zip": "400001",
  "photo": "profile_image_url",
  "IsStatus": "active"
}
```

### Success Response (201)
```json
{
  "success": true,
  "message": "Gym player created successfully",
  "player": {
    "userId": "USER123",
    "name": "John Doe",
    "email": "john.doe@email.com",
    "role": "player",
    "gymId": {
      "name": "Elite Fitness",
      "gymId": "GYM001"
    },
    "subscriptionId": {
      "planName": "Premium Plan",
      "planType": "premium",
      "price": 2000,
      "duration": 6
    },
    "subscriptionStatus": "active"
  }
}
```

## Player Get API

### Endpoint: `GET /api/admin/players?gymId={gymId}`

Retrieves all players for a specific gym with pagination support.

### Query Parameters
- `gymId` (required): The gym ID to fetch players for
- `page` (optional): Page number for pagination (default: 1)  
- `limit` (optional): Items per page (default: 10)

### Success Response (200)
```json
{
  "success": true,
  "players": [
    {
      "userId": "USER123",
      "name": "John Doe", 
      "email": "john.doe@email.com",
      "phone": "9876543210",
      "age": 25,
      "gender": "male",
      "subscriptionStatus": "active",
      "gymId": {
        "name": "Elite Fitness",
        "city": "Mumbai"
      },
      "subscriptionId": {
        "planName": "Premium Plan",
        "price": 2000
      }
    }
  ]
}
```

## Frontend Implementation Example

```javascript
// Add Player
const addPlayer = async (playerData) => {
  const response = await fetch('/api/admin/players', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(playerData)
  });
  return await response.json();
};

// Get Players  
const getPlayers = async (gymId, page = 1) => {
  const response = await fetch(`/api/admin/players?gymId=${gymId}&page=${page}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return await response.json();
};
```

## Error Handling
- **400**: Missing required fields or validation errors
- **401**: Authentication required 
- **403**: Invalid token or insufficient permissions
- **500**: Server error

Always handle these error cases in your frontend implementation for better user experience.