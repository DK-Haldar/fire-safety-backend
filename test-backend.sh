#!/bin/bash

echo "🔥 Fire Safety Pro - Backend API Test"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if backend is running
echo -n "Checking backend server... "
if curl -s http://localhost:5000/api/products > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo "Please start backend first: cd ~/fire-safety-app/backend && npm run dev"
    exit 1
fi

# Test 1: Public Products API
echo -e "\n${BLUE}1. Testing Public Products API${NC}"
PRODUCTS_COUNT=$(curl -s http://localhost:5000/api/products | grep -o '"id"' | wc -l)
echo -e "   Products found: ${GREEN}$PRODUCTS_COUNT${NC}"

# Test 2: Admin Login
echo -e "\n${BLUE}2. Testing Admin Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@firesafety.com","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "   ${GREEN}✓ Admin login successful${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
else
    echo -e "   ${RED}✗ Admin login failed${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

# Test 3: Admin Stats
echo -e "\n${BLUE}3. Testing Admin Stats API${NC}"
STATS=$(curl -s -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer $TOKEN")

if echo "$STATS" | grep -q "totalUsers"; then
    echo -e "   ${GREEN}✓ Stats retrieved successfully${NC}"
    TOTAL_USERS=$(echo "$STATS" | grep -o '"totalUsers":[0-9]*' | grep -o '[0-9]*')
    TOTAL_ORDERS=$(echo "$STATS" | grep -o '"totalOrders":[0-9]*' | grep -o '[0-9]*')
    echo "   📊 Total Users: $TOTAL_USERS"
    echo "   📊 Total Orders: $TOTAL_ORDERS"
else
    echo -e "   ${RED}✗ Failed to get stats${NC}"
fi

# Test 4: Admin Users List
echo -e "\n${BLUE}4. Testing Admin Users API${NC}"
USERS=$(curl -s -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer $TOKEN")

if echo "$USERS" | grep -q "admin"; then
    echo -e "   ${GREEN}✓ Users retrieved successfully${NC}"
    USER_COUNT=$(echo "$USERS" | grep -o '"email"' | wc -l)
    echo "   👥 Total users: $USER_COUNT"
else
    echo -e "   ${YELLOW}⚠ No users found or error${NC}"
fi

# Test 5: Admin Orders List
echo -e "\n${BLUE}5. Testing Admin Orders API${NC}"
ORDERS=$(curl -s -X GET http://localhost:5000/api/admin/orders \
  -H "Authorization: Bearer $TOKEN")

if echo "$ORDERS" | grep -q "orderNumber"; then
    echo -e "   ${GREEN}✓ Orders retrieved successfully${NC}"
    ORDER_COUNT=$(echo "$ORDERS" | grep -o '"orderNumber"' | wc -l)
    echo "   📦 Total orders: $ORDER_COUNT"
else
    echo -e "   ${YELLOW}⚠ No orders found${NC}"
fi

# Test 6: Admin Products List
echo -e "\n${BLUE}6. Testing Admin Products API${NC}"
PRODUCTS=$(curl -s -X GET http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $TOKEN")

if echo "$PRODUCTS" | grep -q "name"; then
    echo -e "   ${GREEN}✓ Products retrieved successfully${NC}"
    PROD_COUNT=$(echo "$PRODUCTS" | grep -o '"name"' | wc -l)
    echo "   🛍️ Total products: $PROD_COUNT"
else
    echo -e "   ${YELLOW}⚠ No products found${NC}"
fi

# Test 7: Admin Services List
echo -e "\n${BLUE}7. Testing Admin Services API${NC}"
SERVICES=$(curl -s -X GET http://localhost:5000/api/admin/services \
  -H "Authorization: Bearer $TOKEN")

if echo "$SERVICES" | grep -q "name"; then
    echo -e "   ${GREEN}✓ Services retrieved successfully${NC}"
    SERV_COUNT=$(echo "$SERVICES" | grep -o '"name"' | wc -l)
    echo "   🔧 Total services: $SERV_COUNT"
else
    echo -e "   ${YELLOW}⚠ No services found${NC}"
fi

# Test 8: Create a test order (requires user token first)
echo -e "\n${BLUE}8. Testing User Registration & Order Creation${NC}"

# Register a test user
TEST_EMAIL="test_$(date +%s)@example.com"
REGISTER=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$TEST_EMAIL\",\"password\":\"123456\",\"phone\":\"9876543210\"}")

if echo "$REGISTER" | grep -q "token"; then
    echo -e "   ${GREEN}✓ User registered successfully${NC}"
    USER_TOKEN=$(echo "$REGISTER" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
    
    # Get a product ID for order
    PRODUCT_ID=$(echo "$PRODUCTS" | grep -o '"_id":"[^"]*' | head -1 | sed 's/"_id":"//')
    
    if [ ! -z "$PRODUCT_ID" ]; then
        # Create order
        ORDER_DATA="{\"items\":[{\"product\":\"$PRODUCT_ID\",\"name\":\"Test Product\",\"quantity\":1,\"price\":1999}],\"subtotal\":1999,\"deliveryFee\":50,\"total\":2049,\"address\":{\"street\":\"Test St\",\"city\":\"Mumbai\",\"pincode\":\"400001\"},\"paymentMethod\":\"cod\"}"
        
        ORDER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/orders \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer $USER_TOKEN" \
          -d "$ORDER_DATA")
        
        if echo "$ORDER_RESPONSE" | grep -q "orderNumber"; then
            echo -e "   ${GREEN}✓ Order created successfully${NC}"
        else
            echo -e "   ${RED}✗ Order creation failed${NC}"
        fi
    fi
else
    echo -e "   ${RED}✗ User registration failed${NC}"
fi

echo ""
echo "======================================"
echo "✅ Backend API Test Complete"
echo "======================================"
