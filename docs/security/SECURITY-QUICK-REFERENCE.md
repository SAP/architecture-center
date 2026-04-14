# Security Quick Reference

## 🔒 Essential Security Utilities

### Import Statements

```typescript
// Authentication & Logging
import { logger } from '@/utils/logger';
import { authStorage } from '@/utils/authStorage';

// Request Management
import { rateLimit, throttle, debounce } from '@/utils/requestThrottle';

// Input Validation
import { 
    sanitizeUrl, 
    sanitizeFileName, 
    sanitizeEmail,
    validators 
} from '@/utils/sanitization';
```

## ⚡ Quick Examples

### 1. Rate Limiting API Calls

```typescript
// Wrap any async function with rate limiting
const submitForm = rateLimit(async (formData) => {
    return await axios.post('/api/submit', formData);
}, { maxRequests: 5, windowMs: 60000 }); // 5 per minute

try {
    await submitForm(data);
} catch (error) {
    // Handle "Rate limit exceeded" error
    logger.error('Rate limit hit', error);
}
```

### 2. Throttling User Actions

```typescript
// Throttle search to max once per 300ms
const handleSearch = throttle((query: string) => {
    performSearch(query);
}, 300);

// Use in component
<input onChange={(e) => handleSearch(e.target.value)} />
```

### 3. Debouncing Input

```typescript
// Wait 500ms after user stops typing
const handleInput = debounce((value: string) => {
    validateInput(value);
}, 500);

<input onChange={(e) => handleInput(e.target.value)} />
```

### 4. Sanitizing User Input

```typescript
// URLs
const safeUrl = sanitizeUrl(userInput);
if (validators.url(safeUrl)) {
    window.location.href = safeUrl;
}

// Email
const safeEmail = sanitizeEmail(userInput);
if (validators.email(safeEmail)) {
    sendEmailTo(safeEmail);
}

// File names
const safeFileName = sanitizeFileName(file.name);
const filePath = `/uploads/${safeFileName}`;
```

### 5. Secure Logging

```typescript
// ✅ DO: Log without sensitive data
logger.info('User action', { action: 'login', username });
logger.error('API error', { endpoint: '/api/users', status: 500 });

// ❌ DON'T: Log sensitive data
logger.info('Token:', token); // NEVER
logger.error('Password failed:', password); // NEVER
```

### 6. Validating Token Format

```typescript
import { validateTokenFormat } from '@/utils/sanitization';

const result = validateTokenFormat(token);
if (!result.valid) {
    logger.error('Invalid token format', result.error);
    return;
}
// Proceed with token
```

## 🚫 Common Mistakes to Avoid

### ❌ DON'T

```typescript
// 1. Don't pass tokens in URLs
navigate(`/dashboard?token=${token}`);

// 2. Don't log sensitive data
console.log('User password:', password);

// 3. Don't trust user input directly
const filePath = `./uploads/${userFileName}`; // Path traversal!
window.location.href = userProvidedUrl; // XSS risk!

// 4. Don't store secrets in code
const API_KEY = 'sk-1234567890abcdef'; // NEVER!

// 5. Don't use dangerouslySetInnerHTML without sanitization
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### ✅ DO

```typescript
// 1. Clear tokens from URL immediately
const token = params.get('token');
history.replace(window.location.pathname);

// 2. Use logger utility
logger.info('User action', { action: 'login' });

// 3. Sanitize user input
const safeFileName = sanitizeFileName(userFileName);
const safeUrl = sanitizeUrl(userProvidedUrl);

// 4. Use environment variables
const apiKey = process.env.API_KEY;

// 5. Sanitize HTML if you must use it
import { sanitizeHtml } from '@/utils/sanitization';
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userInput) }} />
```

## 🎯 Security Patterns

### Pattern 1: Secure Form Submission

```typescript
import { rateLimit } from '@/utils/requestThrottle';
import { sanitizeEmail, validators } from '@/utils/sanitization';
import { logger } from '@/utils/logger';

const submitContactForm = rateLimit(async (data) => {
    // Validate inputs
    if (!validators.email(data.email)) {
        throw new Error('Invalid email');
    }
    
    // Sanitize
    const sanitizedData = {
        email: sanitizeEmail(data.email),
        message: data.message.substring(0, 1000) // Limit length
    };
    
    // Submit
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizedData)
        });
        
        logger.info('Form submitted', { email: sanitizedData.email });
        return response;
    } catch (error) {
        logger.error('Form submission failed', error);
        throw error;
    }
}, { maxRequests: 3, windowMs: 60000 });
```

### Pattern 2: Secure File Upload

```typescript
import { sanitizeFileName, validateInputLength } from '@/utils/sanitization';
import { logger } from '@/utils/logger';

async function handleFileUpload(file: File) {
    // Validate file size
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
        logger.warn('File too large', { size: file.size });
        throw new Error('File must be less than 5MB');
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        logger.warn('Invalid file type', { type: file.type });
        throw new Error('Only JPEG, PNG, and GIF files are allowed');
    }
    
    // Sanitize file name
    const safeFileName = sanitizeFileName(file.name);
    
    // Upload with sanitized name
    const formData = new FormData();
    formData.append('file', file, safeFileName);
    
    logger.info('File upload started', { fileName: safeFileName });
    // ... upload logic
}
```

### Pattern 3: Secure API Request

```typescript
import { rateLimit, throttle } from '@/utils/requestThrottle';
import { logger } from '@/utils/logger';
import { authStorage } from '@/utils/authStorage';

const makeAuthenticatedRequest = rateLimit(async (endpoint: string, data: any) => {
    const authData = authStorage.load();
    
    if (!authData?.token) {
        throw new Error('Not authenticated');
    }
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authData.token}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            logger.error('API request failed', {
                endpoint,
                status: response.status
            });
            throw new Error(`Request failed: ${response.status}`);
        }
        
        return response.json();
    } catch (error) {
        logger.error('API request error', { endpoint, error });
        throw error;
    }
}, { maxRequests: 10, windowMs: 60000 });
```

## 📱 Integration with Components

### React Hook Example

```typescript
import { useState, useCallback } from 'react';
import { debounce } from '@/utils/requestThrottle';
import { validators, sanitizeEmail } from '@/utils/sanitization';

export function useEmailValidation() {
    const [email, setEmail] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [error, setError] = useState('');
    
    const validateEmail = useCallback(
        debounce((value: string) => {
            const sanitized = sanitizeEmail(value);
            const valid = validators.email(sanitized);
            
            setIsValid(valid);
            setError(valid ? '' : 'Invalid email address');
        }, 300),
        []
    );
    
    const handleChange = (value: string) => {
        setEmail(value);
        validateEmail(value);
    };
    
    return { email, isValid, error, handleChange };
}
```

## 🔍 Testing Security Features

### Test Rate Limiting

```typescript
// In your test file
import { rateLimit } from '@/utils/requestThrottle';

test('should enforce rate limit', async () => {
    const fn = rateLimit(async () => 'success', {
        maxRequests: 2,
        windowMs: 1000
    });
    
    await fn(); // OK
    await fn(); // OK
    await expect(fn()).rejects.toThrow('Rate limit exceeded'); // Blocked
});
```

### Test Input Sanitization

```typescript
import { sanitizeUrl, sanitizeFileName } from '@/utils/sanitization';

test('should block javascript: URLs', () => {
    const malicious = 'javascript:alert("XSS")';
    const safe = sanitizeUrl(malicious);
    expect(safe).toBe('');
});

test('should sanitize file names', () => {
    const malicious = '../../etc/passwd';
    const safe = sanitizeFileName(malicious);
    expect(safe).not.toContain('../');
    expect(safe).not.toContain('/');
});
```

## 📞 Getting Help

- **Security Documentation**: See [SECURITY.md](./SECURITY.md)
- **Report Security Issues**: [architecture-center-security@sap.com]
- **Questions**: Open a GitHub discussion (not for vulnerabilities!)

---

**Quick Tip**: Bookmark this page for easy reference during development!
