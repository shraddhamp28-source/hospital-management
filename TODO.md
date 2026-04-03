
# BMD App - Remove Error TODO

## Plan Breakdown
✅ 1. Create .env with MongoDB config [DONE]
✅ 2. Restart server [DONE] - npm start successful, server running on port 5000, MongoDB connected

## Pending Steps
- [ ] 3. Ensure MongoDB service running (if not already)
- [ ] 4. Test app: Open http://localhost:5000 in browser

- [ ] 3. Ensure MongoDB service running on Windows:
  ```
  # Install MongoDB Community Server first if not installed
  # Start service: services.msc → MongoDB → Start
  ```
- [ ] 4. Test app: Open http://localhost:5000
- [ ] 5. Verify features:
  - Browse doctors & book appointment
  - Track with reference ID
  - Admin login: passcode "admin123"
- [ ] 6. Add error handling to server.js (graceful MongoDB reconnect)
