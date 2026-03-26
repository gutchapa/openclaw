#!/bin/bash
TARGET="791865934"
CHANNEL="telegram"

for i in {1..8}; do
  sleep 3600
  RES=$(curl -s -X POST "https://m.trackbus.in/gpsfeed?ra=$RANDOM" -d "device=DC5984440I&vendor=EZEEGPS&operatorcode=harmony&closing=1774235700&zone=r2bits" -H "Content-Type: application/x-www-form-urlencoded")
  ADDR=$(echo "$RES" | grep -o '"address":"[^"]*' | cut -d'"' -f4)
  UPDATED=$(echo "$RES" | grep -o '"last_updatd":"[^"]*' | cut -d'"' -f4)
  STATUS=$(echo "$RES" | grep -o '"status":[0-9]' | cut -d':' -f2)
  
  if [ "$STATUS" == "2" ]; then
    MSG="🏁 **Bus Tracking Ended:** The trip has been completed."
    openclaw message send --channel $CHANNEL --target $TARGET --message "$MSG"
    break
  elif [ -z "$ADDR" ]; then
    MSG="⚠️ **Bus Tracking Error:** Could not fetch the location."
    openclaw message send --channel $CHANNEL --target $TARGET --message "$MSG"
  else
    MSG="🚌 **Hourly Bus Update:**
📍 Location: $ADDR
🕒 Last GPS Ping: $UPDATED"
    openclaw message send --channel $CHANNEL --target $TARGET --message "$MSG"
  fi
done
