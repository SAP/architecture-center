# Security Utilities

This directory contains security-focused utility functions for the SAP Architecture Center.

## Available Utilities

### 📝 Logger ([logger.ts](./logger.ts))

Secure logging that can be controlled per environment.

```typescript
import { logger } from '@/utils/logger';

logger.info('User action', { action: 'login' });
logger.error('API error', error);
logger.warn('Deprecated feature used');
```

**Features:**
- Environment-aware (can disable in production)
- Consistent logging format
- Prevents accidental exposure of sensitive data

---

### 🔐 Authentication Storage ([authStorage.ts](./authStorage.ts))

Manages authentication data with base64 encoding.

```typescript
import { authStorage } from '@/utils/authStorage';

// Save auth data
authStorage.save({ token, email });

// Load auth data
const data = authStorage.load();

// Update partial data
authStorage.update({ email: newEmail });

// Clear all data
authStorage.clear();
```

**⚠️ Security Warning:**
- Uses localStorage (vulnerable to XSS)
- Base64 is encoding, NOT encryption
- See migration guide in [SECURITY.md](../../docs/security/SECURITY.md)

---

### ⏱️ Request Throttling ([requestThrottle.ts](./requestThrottle.ts))

Rate limiting and throttling to prevent abuse.

```typescript
import { rateLimit, throttle, debounce } from '@/utils/requestThrottle';

// Rate limit API calls
const apiCall = rateLimit(async (data) => {
    return await fetch('/api/endpoint', { 
        method: 'POST', 
        body: JSON.stringify(data) 
    });
}, { maxRequests: 10, windowMs: 60000 }); // 10 per minute

// Throttle user actions
const handleScroll = throttle(() => {
    updateScrollPosition();
}, 100); // Max once per 100ms

// Debounce input
const handleInput = debounce((value) => {
    validateInput(value);
}, 300); // Wait 300ms after last input
```

**Use Cases:**
- Prevent API abuse
- Limit expensive operations
- Improve UX by reducing unnecessary calls
- Defense against DoS attacks

---

### 🛡️ Input Sanitization ([sanitization.ts](./sanitization.ts))

Comprehensive input validation and sanitization.

```typescript
import { 
    sanitizeUrl, 
    sanitizeFileName,
    sanitizeEmail,
    validators 
} from '@/utils/sanitization';

// Sanitize URLs
const safeUrl = sanitizeUrl(userInput);
if (validators.url(safeUrl)) {
    window.location.href = safeUrl;
}

// Sanitize file names (prevent path traversal)
const safeFileName = sanitizeFileName(file.name);

// Validate and sanitize email
const safeEmail = sanitizeEmail(userInput);
if (validators.email(safeEmail)) {
    sendEmail(safeEmail);
}

// Validate username
if (validators.username(input)) {
    // Username is valid
}
```

**Available Functions:**
- `sanitizeUrl()` - Prevents URL injection
- `sanitizeFileName()` - Prevents path traversal
- `sanitizeEmail()` - Email validation
- `sanitizeHtml()` - XSS prevention
- `sanitizeAttribute()` - HTML attribute escaping
- `sanitizeObjectKeys()` - Prototype pollution prevention
- `validateTokenFormat()` - JWT format validation
- `validators.*` - Pre-configured validators

---

## Quick Start

### 1. Import What You Need

```typescript
// Import individual utilities
import { logger } from '@/utils/logger';
import { rateLimit } from '@/utils/requestThrottle';
import { sanitizeUrl } from '@/utils/sanitization';

// Or import multiple from same file
import { 
    throttle, 
    debounce, 
    rateLimit 
} from '@/utils/requestThrottle';
```

### 2. Apply to Your Code

**Example: Secure Form Submission**

```typescript
import { rateLimit } from '@/utils/requestThrottle';
import { sanitizeEmail, validators } from '@/utils/sanitization';
import { logger } from '@/utils/logger';

const handleSubmit = rateLimit(async (formData) => {
    // Validate
    if (!validators.email(formData.email)) {
        throw new Error('Invalid email');
    }
    
    // Sanitize
    const data = {
        email: sanitizeEmail(formData.email),
        message: formData.message.substring(0, 1000)
    };
    
    // Submit
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        logger.info('Form submitted');
        return response;
    } catch (error) {
        logger.error('Submission failed', error);
        throw error;
    }
}, { maxRequests: 3, windowMs: 60000 });
```

**Example: Secure File Upload**

```typescript
import { sanitizeFileName } from '@/utils/sanitization';
import { logger } from '@/utils/logger';

function handleFileUpload(file: File) {
    // Validate size
    if (file.size > 5 * 1024 * 1024) {
        throw new Error('File too large');
    }
    
    // Validate type
    const allowed = ['image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
        throw new Error('Invalid file type');
    }
    
    // Sanitize name
    const safeName = sanitizeFileName(file.name);
    
    logger.info('File upload', { fileName: safeName });
    // ... upload logic
}
```

## Common Patterns

### Pattern 1: Search with Debouncing

```typescript
import { debounce } from '@/utils/requestThrottle';

const SearchComponent = () => {
    const handleSearch = debounce((query: string) => {
        performSearch(query);
    }, 300);
    
    return (
        <input 
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search..."
        />
    );
};
```

### Pattern 2: API Call with Rate Limiting

```typescript
import { rateLimit } from '@/utils/requestThrottle';
import { logger } from '@/utils/logger';

const fetchData = rateLimit(async (id: string) => {
    try {
        const response = await fetch(`/api/data/${id}`);
        const data = await response.json();
        logger.info('Data fetched', { id });
        return data;
    } catch (error) {
        logger.error('Fetch failed', { id, error });
        throw error;
    }
}, { maxRequests: 20, windowMs: 60000 });
```

### Pattern 3: URL Navigation with Sanitization

```typescript
import { sanitizeUrl, validators } from '@/utils/sanitization';
import { logger } from '@/utils/logger';

function navigateToUrl(url: string) {
    const safe = sanitizeUrl(url);
    
    if (!validators.url(safe)) {
        logger.warn('Invalid URL blocked', { url });
        return;
    }
    
    window.location.href = safe;
}
```

## Testing

### Test Rate Limiting

```typescript
import { rateLimit } from '@/utils/requestThrottle';

test('enforces rate limit', async () => {
    const fn = rateLimit(
        async () => 'success',
        { maxRequests: 2, windowMs: 1000 }
    );
    
    await fn(); // OK
    await fn(); // OK
    await expect(fn()).rejects.toThrow('Rate limit exceeded');
});
```

### Test Sanitization

```typescript
import { sanitizeUrl, sanitizeFileName } from '@/utils/sanitization';

test('blocks javascript: URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
});

test('sanitizes file names', () => {
    expect(sanitizeFileName('../../etc/passwd')).not.toContain('/');
});
```

## Documentation

For complete documentation, see:
- **[SECURITY.md](../../docs/security/SECURITY.md)** - Full security guide
- **[SECURITY-QUICK-REFERENCE.md](../../docs/security/SECURITY-QUICK-REFERENCE.md)** - Quick reference
- **[SECURITY-IMPROVEMENTS.md](../../docs/security/SECURITY-IMPROVEMENTS.md)** - Implementation summary

## Best Practices

### ✅ DO

- Use `logger` instead of `console.log`
- Rate limit all API endpoints
- Sanitize all user inputs
- Validate data before processing
- Use throttle/debounce for expensive operations

### ❌ DON'T

- Log sensitive data (tokens, passwords)
- Trust user input without validation
- Skip sanitization for "internal" inputs
- Ignore rate limit errors
- Use console.log in production code

## Questions?

- Security concerns: See [SECURITY.md](../../docs/security/SECURITY.md)
- Technical help: Open a GitHub discussion
- Report vulnerabilities: [architecture-center-security@sap.com]

---

**Last Updated:** 2026-04-14  
**Maintained By:** SAP Architecture Center Security Team
