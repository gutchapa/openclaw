# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

### Eazydiner API (Reverse Engineered)
- **Endpoint:** `POST https://force.eazydiner.com/web/bookings?medium=web`
- **Headers Needed:** `Authorization: Bearer <token>`, `medium: web`, `build: 61630`
- **Payload:** `{"date":"YYYY-MM-DD","pax":2,"restaurant":"city/restaurant-slug","lat_long":"13.0807591,80.1967055","name":"RamEsh","mobile":"+91<number>","time":"01:30 PM","deal_id":10147318,"whatsappoptin":"0","email":"<email>","web_return_url":"...","callback_url":"..."}`
- **Note:** DO NOT use browser UI. Just use `curl`.
