#!/bin/bash
TARGET="791865934"
CHANNEL="telegram"
# Polling every 3 minutes (180s)
while true; do
  sleep 180
  RES=$(curl -s -X POST "https://m.trackbus.in/gpsfeed?ra=$RANDOM" -d "device=DC5984440I&vendor=EZEEGPS&operatorcode=harmony&closing=1774235700&zone=r2bits" -H "Content-Type: application/x-www-form-urlencoded")
  ADDR=$(echo "$RES" | grep -o '"address":"[^"]*' | cut -d'"' -f4 | tr '[:lower:]' '[:upper:]')
  STATUS=$(echo "$RES" | grep -o '"status":[0-9]' | cut -d':' -f2)
  
  if [ "$STATUS" == "2" ]; then
    break
  fi
  
  if echo "$ADDR" | grep -q "TIGER"; then
    MSG="🚨 **Bus Alert:** The bus has reached the Tiger Circle area!
📍 Location: $(echo "$RES" | grep -o '"address":"[^"]*' | cut -d'"' -f4)"
    openclaw message send --channel $CHANNEL --target $TARGET --message "$MSG"
    break
  fi
  
  if echo "$ADDR" | grep -q "MANIPAL"; then
    MSG="🚨 **Bus Alert:** The bus has reached Manipal (near Tiger Circle)!
📍 Location: $(echo "$RES" | grep -o '"address":"[^"]*' | cut -d'"' -f4)"
    openclaw message send --channel $CHANNEL --target $TARGET --message "$MSG"
    break
  fi
done
