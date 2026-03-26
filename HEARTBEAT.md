# Heartbeat Tasks

- **Daily Usage Report**: Once a day, preferably between 22:00 and 23:59 IST (Indian Standard Time, which is 16:30 to 18:29 UTC), run the `session_status` tool. If you haven't sent the daily usage report for today yet, send the user a quick message summarizing their token usage and cost for the day. Track that you sent it in `memory/heartbeat-state.json`.