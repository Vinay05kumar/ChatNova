# Minimal demo fixes
- [x] Preserve the existing mandatory popup and session-cookie integration without checkout/API changes.
- [x] Update attribution replacement.
- [ ] Add *.pem beside *.local: blocked because .gitignore is platform-protected and read-only to edits.
- [x] Run all 19 tests; automatic build reported OK. Verify attribution sequence, real authentication errors, popup dismissal prevention, and cart retention in the browser. No tracked PEM files found.
- [x] Report limitations: live authentication success and completed checkout/orders remain unverified because the external service is unavailable; production build is harness-managed and was not manually run.