# API Testing Guide for Gym Owner Authentication

## Postman Collection Setup

### Environment Variables
Create a Postman environment with these variables:
```json
{
  "baseUrl": "http://localhost:3400/api/gym-owner",
  "accessToken": "",
  "refreshToken": "",
  "userId": "",
  "gymId": ""
}
```

## API Endpoints Testing

### 1. Login API Test

**Request:**
```
POST {{baseUrl}}/login
Content-Type: application/json

{
  "email": "trainer@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "email": "trainer@example.com",
    "role": "trainer",
    "gym": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "gymId": "GYM001",
      "name": "Elite Fitness Center",
      "city": "New York",
      "state": "NY"
    }
  }
}
```

**Post-request Script (Postman):**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.success) {
        pm.environment.set("accessToken", response.accessToken);
        pm.environment.set("refreshToken", response.refreshToken);
        pm.environment.set("userId", response.user.id);
        pm.environment.set("gymId", response.user.gym._id);
        
        console.log("Login successful!");
        console.log("User ID:", response.user.id);
        console.log("Gym ID:", response.user.gym._id);
        console.log("Gym Data:", response.user.gym);
    }
}
```

### 2. Get Profile API Test

**Request:**
```
GET {{baseUrl}}/profile
Authorization: Bearer {{accessToken}}
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "email": "trainer@example.com",
    "role": "trainer",
    "gymId": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "gymId": "GYM001",
      "name": "Elite Fitness Center",
      "city": "New York",
      "state": "NY"
    }
  }
}
```

### 3. Refresh Token API Test

**Request:**
```
POST {{baseUrl}}/refresh-token
Content-Type: application/json

{
  "refreshToken": "{{refreshToken}}"
}
```

**Expected Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Post-request Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.success) {
        pm.environment.set("accessToken", response.accessToken);
        console.log("Token refreshed successfully!");
    }
}
```

### 4. Logout API Test

**Request:**
```
POST {{baseUrl}}/logout
Content-Type: application/json

{
  "refreshToken": "{{refreshToken}}"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Post-request Script:**
```javascript
if (pm.response.code === 200) {
    pm.environment.set("accessToken", "");
    pm.environment.set("refreshToken", "");
    pm.environment.set("userId", "");
    pm.environment.set("gymId", "");
    console.log("Logged out successfully!");
}
```

## cURL Examples

### Login
```bash
curl -X POST http://localhost:3400/api/gym-owner/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trainer@example.com",
    "password": "password123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:3400/api/gym-owner/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:3400/api/gym-owner/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Logout
```bash
curl -X POST http://localhost:3400/api/gym-owner/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Test Scenarios

### 1. Successful Login Flow
1. Call login API with valid credentials
2. Store tokens and user data
3. Use access token for authenticated requests
4. Test profile API with stored token

### 2. Token Refresh Flow
1. Wait for access token to expire (15 minutes)
2. Make authenticated request (should fail with 403)
3. Call refresh token API
4. Retry authenticated request with new token

### 3. Invalid Token Scenarios
1. Test with expired access token
2. Test with invalid refresh token
3. Test with malformed tokens

### 4. Logout Flow
1. Login successfully
2. Make authenticated request (should work)
3. Logout using refresh token
4. Try authenticated request (should fail)

## Error Testing

### Invalid Login
```json
{
  "email": "wrong@email.com",
  "password": "wrongpassword"
}
```
Expected: 400 status with error message

### Missing Authorization Header
```
GET /profile
```
Expected: 401 status with "Access token required"

### Expired/Invalid Token
```
Authorization: Bearer invalid_token
```
Expected: 403 status with "Token invalid or expired"

## Frontend Integration Testing

Use this JavaScript snippet to test the APIs from browser console:

```javascript
// Test login
async function testLogin() {
  const response = await fetch('http://localhost:3400/api/gym-owner/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'trainer@example.com',
      password: 'password123'
    })
  });
  
  const data = await response.json();
  console.log('Login Response:', data);
  
  if (data.success) {
    // Store tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('userId', data.user.id);
    localStorage.setItem('gymId', data.user.gym._id);
    localStorage.setItem('gymData', JSON.stringify(data.user.gym));
    
    console.log('Stored User ID:', data.user.id);
    console.log('Stored Gym ID:', data.user.gym._id);
    console.log('Stored Gym Data:', data.user.gym);
  }
}

// Test authenticated request
async function testProfile() {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:3400/api/gym-owner/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  console.log('Profile Response:', data);
}

// Test refresh token
async function testRefresh() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('http://localhost:3400/api/gym-owner/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  const data = await response.json();
  console.log('Refresh Response:', data);
  
  if (data.success) {
    localStorage.setItem('accessToken', data.accessToken);
  }
}

// Test logout
async function testLogout() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('http://localhost:3400/api/gym-owner/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  const data = await response.json();
  console.log('Logout Response:', data);
  
  if (data.success) {
    localStorage.clear();
  }
}

// Run tests
console.log('Testing authentication APIs...');
testLogin().then(() => {
  setTimeout(() => testProfile(), 1000);
});
```

This testing guide ensures your authentication system works correctly before integrating with your frontend application.
