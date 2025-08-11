# Vercel Deployment Integration Setup

This guide explains how to set up the Vercel API integration for selective restaurant deployments.

## **Overview**

The system now supports:
- **Selective building**: Deploy only specific restaurants (fast)
- **Full building**: Deploy all restaurants (comprehensive)
- **Real-time status**: Track deployment progress via Vercel API

## **Required Environment Variables**

Add these to your `.env` file:

```bash
# Vercel API Configuration
VERCEL_TOKEN=your-vercel-api-token-here
VERCEL_PROJECT_ID=your-vercel-project-id-here
VERCEL_TEAM_ID=your-vercel-team-id-here
VERCEL_DOMAIN=digidinez.vercel.app
```

## **How to Get These Values**

### **1. VERCEL_TOKEN**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your profile → Settings → Tokens
3. Create a new token with "Full Account" scope
4. Copy the token value

### **2. VERCEL_PROJECT_ID**
1. Go to your `public-menu` project in Vercel
2. Click on "Settings" tab
3. Scroll down to "General" section
4. Copy the "Project ID"

### **3. VERCEL_TEAM_ID** (Optional)
1. If using a team, go to Team Settings
2. Copy the Team ID from the URL or settings
3. If not using a team, leave this empty

### **4. VERCEL_DOMAIN**
1. This is your Vercel project domain
2. Default: `digidinez.vercel.app`
3. You can customize this in project settings

## **How It Works**

### **Selective Deployment Flow**
1. Restaurant owner clicks "Deploy" button
2. API calls Vercel with `RESTAURANT_ID` environment variable
3. Vercel builds only that restaurant's menu
4. Result: **Fast deployments** (1-2 minutes vs 5-10 minutes)

### **Environment Variable Override**
```bash
# Normal build (all restaurants)
npm run build:prod

# Selective build (single restaurant)
RESTAURANT_ID=123 SELECTIVE_BUILD=true npm run build:prod
```

## **API Endpoints**

### **Trigger Deployment**
```http
POST /api/deployment/trigger
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deployment": {
      "id": "vercel-deployment-id",
      "restaurantId": "restaurant-id",
      "status": "pending",
      "vercelUrl": "https://deployment-url.vercel.app",
      "estimatedTime": "1-2 minutes"
    }
  }
}
```

### **Check Deployment Status**
```http
GET /api/deployment/:id/status
Authorization: Bearer <jwt-token>
```

### **Get Recent Deployments**
```http
GET /api/deployment/recent
Authorization: Bearer <jwt-token>
```

## **Testing**

### **1. Test Selective Building**
```bash
cd public-menu
RESTAURANT_ID=your-restaurant-id SELECTIVE_BUILD=true npm run build:ssg
```

### **2. Test Full Building**
```bash
cd public-menu
npm run build:ssg
```

### **3. Test Deployment API**
```bash
# Start your API server
cd api
npm run dev

# In another terminal, test the endpoint
curl -X POST http://localhost:5000/api/deployment/trigger \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json"
```

## **Troubleshooting**

### **Common Issues**

1. **"Vercel configuration missing"**
   - Check that all environment variables are set
   - Verify `.env` file is in the correct location

2. **"Vercel API error: 401"**
   - Your `VERCEL_TOKEN` is invalid or expired
   - Generate a new token in Vercel dashboard

3. **"Project not found"**
   - Check `VERCEL_PROJECT_ID` is correct
   - Ensure the project exists in your Vercel account

4. **"Team not found"**
   - Check `VERCEL_TEAM_ID` if using teams
   - Leave empty if not using teams

### **Debug Mode**
Enable debug logging in your `.env`:
```bash
DEBUG=vercel:*
```

## **Performance Benefits**

- **Before**: Full rebuild of all restaurants (5-10 minutes)
- **After**: Selective rebuild of one restaurant (1-2 minutes)
- **Improvement**: **5x faster deployments** 🚀

## **Security Notes**

- `VERCEL_TOKEN` has full account access - keep it secure
- Tokens are stored in environment variables, not in code
- Each restaurant can only deploy their own menu
- JWT authentication required for all deployment endpoints
