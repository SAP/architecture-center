# Security Guidelines - SAP Architecture Center

## Overview

This document outlines the security measures, best practices, and guidelines implemented in the SAP Architecture Center project to protect against common web vulnerabilities and ensure data security.

## 🛡️ Security Features Implemented

### 1. Security Headers

Location: [`src/plugins/security-headers/`](../src/plugins/security-headers/)

The project implements comprehensive HTTP security headers:

- **Content Security Policy (CSP)**: Restricts resource loading to prevent XSS attacks
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Strict-Transport-Security (HSTS)**: Enforces HTTPS connections
- **Permissions-Policy**: Restricts browser features (camera, geolocation, etc.)
- **Referrer-Policy**: Controls referrer information leakage

### 2. Authentication & Token Management

Location: [`src/context/AuthContext.tsx`](../src/context/AuthContext.tsx), [`src/utils/authStorage.ts`](../src/utils/authStorage.ts)

**Current Implementation:**
- JWT tokens for authentication (GitHub and BTP)
- Automatic token expiration handling
- Secure URL parameter handling (tokens cleared from browser history immediately)

**⚠️ Known Limitations:**
- Tokens stored in localStorage (vulnerable to XSS attacks)
- Base64 encoding only (NOT encryption)

**🔒 Recommended Migration Path:**
```typescript
// Current (localStorage):
localStorage.setItem('jwt_token', JSON.stringify({ token, expiresAt }));

// Recommended (httpOnly cookies):
// Backend should set:
Set-Cookie: token=xxx; HttpOnly; Secure; SameSite=Strict; Max-Age=7200
```

**Benefits of httpOnly cookies:**
- Not accessible via JavaScript (XSS protection)
- Automatically sent with requests
- Secure flag ensures HTTPS-only transmission
- SameSite prevents CSRF attacks

### 3. Request Throttling & Rate Limiting

Location: [`src/utils/requestThrottle.ts`](../src/utils/requestThrottle.ts)

Utilities to prevent abuse and DoS attacks:

```typescript
import { rateLimit, throttle, debounce } from '@/utils/requestThrottle';

// Rate limit API calls
const validateArchitecture = rateLimit(async (data) => {
    return await axios.post(apiUrl, data);
}, { maxRequests: 10, windowMs: 60000 }); // 10 requests per minute

// Throttle user actions
const handleSearch = throttle((query) => {
    performSearch(query);
}, 300); // Max once per 300ms

// Debounce input
const handleInput = debounce((value) => {
    processInput(value);
}, 500); // Wait 500ms after last input
```

### 4. Input Sanitization

Location: [`src/utils/sanitization.ts`](../src/utils/sanitization.ts)

Comprehensive input validation and sanitization:

```typescript
import { sanitizeUrl, sanitizeFileName, validators } from '@/utils/sanitization';

// Sanitize URLs to prevent injection
const safeUrl = sanitizeUrl(userProvidedUrl);

// Validate email
if (validators.email(userEmail)) {
    // Email is valid
}

// Sanitize file names to prevent path traversal
const safeFileName = sanitizeFileName(uploadedFile.name);
```

### 5. Logging

Location: [`src/utils/logger.ts`](../src/utils/logger.ts)

Secure logging that can be disabled in production:

```typescript
import { logger } from '@/utils/logger';

logger.info('User logged in', { username }); // Safe, no sensitive data
logger.error('Authentication failed', error);

// ❌ DON'T: Log sensitive information
// logger.info('Token:', token); // NEVER log tokens!
```

## 🚨 Common Vulnerabilities & Prevention

### Cross-Site Scripting (XSS)

**What is it:** Injecting malicious scripts into web pages viewed by other users.

**Our Protection:**
- ✅ React automatically escapes JSX content
- ✅ Content Security Policy blocks inline scripts (with nonce)
- ✅ Input sanitization utilities available
- ⚠️ Avoid `dangerouslySetInnerHTML` unless absolutely necessary

**Example:**
```tsx
// ✅ SAFE - React automatically escapes
<div>{userInput}</div>

// ⚠️ DANGEROUS - Only use if HTML is sanitized
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userInput) }} />

// ❌ NEVER DO THIS
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### Cross-Site Request Forgery (CSRF)

**What is it:** Forcing authenticated users to execute unwanted actions.

**Our Protection:**
- ✅ SameSite cookies (when using httpOnly cookies)
- ✅ Custom headers required for API requests
- ✅ Origin validation on backend

### SQL Injection

**What is it:** Injecting malicious SQL queries through user input.

**Our Protection:**
- ✅ Backend uses parameterized queries (not frontend responsibility)
- ✅ Input validation before sending to API

### Authentication Token Exposure

**What is it:** Tokens leaked through URLs, logs, or client-side storage.

**Our Protection:**
- ✅ Tokens immediately cleared from URL after reading
- ✅ Tokens not logged in console
- ⚠️ Tokens in localStorage (migration to httpOnly cookies recommended)

**Best Practices:**
```typescript
// ❌ DON'T: Pass tokens in URL
window.location.href = `/page?token=${token}`;

// ❌ DON'T: Log tokens
console.log('User token:', token);

// ✅ DO: Use Authorization header
fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
});

// ✅ DO: Clear tokens from URL immediately
const token = params.get('token');
history.replace(window.location.pathname); // Clear URL
```

### Path Traversal

**What is it:** Accessing files outside intended directory using `../` sequences.

**Our Protection:**
- ✅ File name sanitization removes path separators
- ✅ Backend validates file paths

**Example:**
```typescript
import { sanitizeFileName } from '@/utils/sanitization';

// ❌ DANGEROUS
const filePath = `./uploads/${userFileName}`; // Could be "../../etc/passwd"

// ✅ SAFE
const filePath = `./uploads/${sanitizeFileName(userFileName)}`;
```

## 🔐 Environment Variables

**Critical Rules:**
1. ❌ **NEVER** commit `.env` files to git
2. ✅ `.env.example` should contain dummy values only
3. ✅ Production secrets must be in deployment environment, not code
4. ✅ Use different credentials for dev/staging/production

**Verify `.env` is ignored:**
```bash
git check-ignore .env  # Should output: .env
git ls-files .env      # Should output nothing
```

## 📋 Security Checklist for Developers

### Before Committing Code

- [ ] No hardcoded secrets (API keys, tokens, passwords)
- [ ] No sensitive data logged to console
- [ ] User inputs are validated and sanitized
- [ ] API calls use rate limiting for sensitive operations
- [ ] URLs are sanitized before use
- [ ] File uploads validate file types and sizes
- [ ] Error messages don't expose sensitive information

### Before Deploying

- [ ] Environment variables configured in deployment platform
- [ ] HTTPS enforced (Strict-Transport-Security header)
- [ ] Security headers verified
- [ ] Dependencies updated (`npm audit`)
- [ ] Authentication tokens use httpOnly cookies (when implemented)
- [ ] Rate limiting configured on backend
- [ ] CSP tested and no violations in console

### Code Review Checklist

- [ ] No use of `eval()` or `Function()` constructor
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] No sensitive data in URLs
- [ ] API endpoints require authentication where needed
- [ ] Input validation on both frontend and backend
- [ ] Proper error handling (no stack traces to users)

## 🛠️ Security Tools & Scripts

### NPM Security Audit

```bash
# Check for vulnerable dependencies
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Run full security check (audit + outdated)
npm run security:check

# Update dependencies and fix vulnerabilities
npm run security:update
```

### Testing Security Headers

```bash
# After building
npm run build

# Check security headers in _headers file
cat build/_headers

# Test CSP in browser console (should show violations)
```

## 🚀 Future Security Enhancements

### High Priority

1. **Migrate to httpOnly Cookies**
   - Backend sets cookies instead of tokens in response
   - Remove localStorage token storage
   - Update AuthContext to work with cookies

2. **Implement CSP Nonces**
   - Move to Server-Side Rendering (SSR)
   - Generate unique nonce for each request
   - Remove 'unsafe-inline' from CSP

3. **Add CSP Reporting**
   - Set up reporting endpoint `/api/csp-report`
   - Monitor and analyze CSP violations
   - Gradually tighten CSP rules

### Medium Priority

4. **Two-Factor Authentication (2FA)**
   - Add TOTP support for sensitive operations
   - Backup codes for account recovery

5. **Security Scanning in CI/CD**
   - Automated dependency scanning
   - SAST (Static Application Security Testing)
   - Container scanning for deployment

6. **Rate Limiting on Backend**
   - Implement per-user rate limits
   - IP-based rate limiting
   - Progressive delays for failed auth attempts

### Low Priority

7. **Subresource Integrity (SRI)**
   - Add integrity hashes for external scripts
   - Verify CDN resources haven't been tampered with

8. **Security.txt**
   - Add `/.well-known/security.txt` with security contact info
   - Follow RFC 9116 standard

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Security Headers Best Practices](https://securityheaders.com/)

## 🆘 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email security concerns to: [architecture-center-security@sap.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## 📝 Change Log

- **2026-04-14**: Initial security documentation created
  - Added security headers plugin
  - Implemented request throttling utilities
  - Created input sanitization utilities
  - Enhanced token URL handling
  - Replaced console.log with logger utility

---

**Last Updated:** 2026-04-14  
**Maintained By:** SAP Architecture Center Security Team
