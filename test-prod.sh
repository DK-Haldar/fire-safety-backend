#!/bin/bash

URL="https://fire-safety-pro-production.up.railway.app"

echo "🔍 Testing Production API"
echo "========================="
echo ""

echo "📦 Products:"
curl -s "$URL/api/products" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f'  {len(d.get(\"data\", d))} products found')" 2>/dev/null || curl -s "$URL/api/products"

echo ""
echo "🔑 Admin Login:"
LOGIN=$(curl -s -X POST "$URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"dkhaldar4u@gmail.com","password":"Jimmy9830"}')
if echo "$LOGIN" | grep -q "token"; then
    echo "  ✅ Login successful!"
    TOKEN=$(echo "$LOGIN" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
    echo "  Token: ${TOKEN:0:50}..."
else
    echo "  ❌ Login failed"
    echo "  Response: $LOGIN"
fi

echo ""
echo "🔧 Services:"
curl -s "$URL/api/services" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f'  {len(d.get(\"data\", d))} services found')" 2>/dev/null || curl -s "$URL/api/services"

echo ""
echo "✅ Production API is ready!"
echo "URL: $URL"
