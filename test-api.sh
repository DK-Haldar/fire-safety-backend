#!/bin/bash

echo "🧪 Testing Fire Safety Pro API"
echo "================================"
echo ""

# Test root endpoint
echo "📡 Testing root endpoint:"
curl -s http://localhost:5000/ | jq '.' 2>/dev/null || curl -s http://localhost:5000/
echo ""

# Test products
echo -e "\n📦 Testing products endpoint:"
curl -s http://localhost:5000/api/products | jq '.' 2>/dev/null || curl -s http://localhost:5000/api/products
echo ""

# Test services
echo -e "\n🔧 Testing services endpoint:"
curl -s http://localhost:5000/api/services | jq '.' 2>/dev/null || curl -s http://localhost:5000/api/services
echo ""

echo "✅ API test complete!"
