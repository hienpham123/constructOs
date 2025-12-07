#!/bin/bash

# Test Group Chat API
# Usage: ./test_group_chat_api.sh

API_URL="http://localhost:2222/api"
TOKEN="${1:-}" # Get token from first argument or empty

if [ -z "$TOKEN" ]; then
    echo "Usage: $0 <auth_token>"
    echo "Example: $0 'your-jwt-token-here'"
    exit 1
fi

echo "Testing Group Chat API..."
echo "========================="
echo ""

# Test GET /api/group-chats
echo "1. Testing GET /api/group-chats"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -H "Authorization: Bearer $TOKEN" "$API_URL/group-chats")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

echo "HTTP Code: $http_code"
echo "Response:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo ""

if [ "$http_code" = "200" ]; then
    echo "✅ GET /api/group-chats: SUCCESS"
else
    echo "❌ GET /api/group-chats: FAILED"
fi

