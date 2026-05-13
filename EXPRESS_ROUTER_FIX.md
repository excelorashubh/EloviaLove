# 🔧 Express Router Error Fix - Complete Guide

## 🚨 THE ERROR

```
TypeError: Router.use() requires a middleware function but got a Object
Stack trace:
  at Function.use (/node_modules/express/lib/router/index.js:469:13)
  at Function.<anonymous> (/node_modules/express/lib/application.js:227:21)
  at Object.<anonymous> (/server/server.js:200:5)
```

---

## 🎯 ROOT CAUSE

**Line 200 in server.js:**
```javascript
app.use('/api/seo', require('./routes/seo'));  // ❌ WRONG
```

**Problem:** `routes/seo.js` exports an **object** instead of a **router**:

```javascript
// routes/seo.js
module.exports = {
  router,              // ❌ Exporting as object property
  prerenderMiddleware
};
```

**What Express expects:**
```javascript
app.use('/api/seo', router);  // ✅ Expects a Router instance or middleware function
```

**What it got:**
```javascript
app.use('/api/seo', { router, prerenderMiddleware });  // ❌ Got an object
```

---

## ✅ THE FIX

### Option 1: Destructure in server.js (APPLIED)

```javascript
// server.js
const seoModule = require('./routes/seo');
app.use(seoModule.prerenderMiddleware);  // Use middleware
app.use('/api/seo', seoModule.router);   // Use router
```

### Option 2: Change seo.js export (Alternative)

```javascript
// routes/seo.js
module.exports = router;  // Export router directly

// Export middleware separately
module.exports.prerenderMiddleware = prerenderMiddleware;
```

Then in server.js:
```javascript
const seoRouter = require('./routes/seo');
app.use(seoRouter.prerenderMiddleware);
app.use('/api/seo', seoRouter);
```

### Option 3: Separate files (Best Practice)

```javascript
// routes/seo.js - Only router
module.exports = router;

// middleware/seo.js - Only middleware
module.exports = { prerenderMiddleware };
```

Then in server.js:
```javascript
const { prerenderMiddleware } = require('./middleware/seo');
const seoRouter = require('./routes/seo');

app.use(prerenderMiddleware);
app.use('/api/seo', seoRouter);
```

---

## 📚 CORRECT EXPORT PATTERNS

### ✅ Pattern 1: Direct Router Export (RECOMMENDED)

```javascript
// routes/example.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Hello' });
});

module.exports = router;  // ✅ Export router directly
```

```javascript
// server.js
app.use('/api/example', require('./routes/example'));  // ✅ Works
```

### ✅ Pattern 2: Named Export with Default

```javascript
// routes/example.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Hello' });
});

module.exports = router;  // Default export
module.exports.someHelper = () => {};  // Additional export
```

```javascript
// server.js
const exampleRouter = require('./routes/example');
app.use('/api/example', exampleRouter);  // ✅ Works
```

### ❌ Pattern 3: Object Export (CAUSES ERROR)

```javascript
// routes/example.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Hello' });
});

module.exports = { router };  // ❌ WRONG - exports object
```

```javascript
// server.js
app.use('/api/example', require('./routes/example'));  // ❌ ERROR!
// TypeError: Router.use() requires a middleware function but got a Object
```

**Fix:**
```javascript
// server.js
app.use('/api/example', require('./routes/example').router);  // ✅ Works
```

---

## 🔍 HOW TO DEBUG THIS ERROR

### Step 1: Identify the Problematic Route

Look at the stack trace:
```
at Object.<anonymous> (/server/server.js:200:5)
```

Line 200 is the problem. Check what's on that line:
```javascript
app.use('/api/seo', require('./routes/seo'));  // Line 200
```

### Step 2: Check the Route File Export

Open `routes/seo.js` and look at the bottom:
```javascript
module.exports = {
  router,              // ❌ This is the problem
  prerenderMiddleware
};
```

### Step 3: Verify the Export Type

Add a console.log to debug:
```javascript
const seoModule = require('./routes/seo');
console.log('Type:', typeof seoModule);  // "object"
console.log('Is Router?', typeof seoModule.use);  // "undefined"
console.log('Has router?', typeof seoModule.router);  // "function"
```

### Step 4: Fix the Import

```javascript
// ❌ BEFORE
app.use('/api/seo', require('./routes/seo'));

// ✅ AFTER
const seoModule = require('./routes/seo');
app.use('/api/seo', seoModule.router);
```

---

## 🛡️ PREVENTION CHECKLIST

### For Route Files

- [ ] Export router directly: `module.exports = router;`
- [ ] If exporting multiple things, make router the default
- [ ] Never export `{ router }` unless you handle it in server.js
- [ ] Keep middleware in separate files when possible

### For server.js

- [ ] Always check what you're passing to `app.use()`
- [ ] Use destructuring when importing objects
- [ ] Test each route import individually
- [ ] Add console.log to verify types during development

### Testing

```javascript
// Add this temporarily to debug
const testRoute = require('./routes/seo');
console.log('Route type:', typeof testRoute);
console.log('Has use method?', typeof testRoute.use);
console.log('Keys:', Object.keys(testRoute));
```

---

## 📋 COMMON MISTAKES

### Mistake 1: Destructuring Wrong

```javascript
// ❌ WRONG
const { prerenderMiddleware } = require('./routes/seo');
app.use('/api/seo', require('./routes/seo'));  // Still gets object!
```

```javascript
// ✅ CORRECT
const { router, prerenderMiddleware } = require('./routes/seo');
app.use(prerenderMiddleware);
app.use('/api/seo', router);
```

### Mistake 2: Exporting Array

```javascript
// ❌ WRONG
module.exports = [router, middleware];
```

```javascript
// ✅ CORRECT
module.exports = router;
module.exports.middleware = middleware;
```

### Mistake 3: Exporting Function that Returns Router

```javascript
// ❌ CONFUSING
module.exports = () => router;
```

```javascript
// ✅ CLEAR
module.exports = router;
```

---

## 🎯 BEST PRACTICES

### 1. Consistent Export Pattern

**Use this pattern for ALL route files:**

```javascript
// routes/*.js
const express = require('express');
const router = express.Router();

// ... define routes ...

module.exports = router;  // Always export router directly
```

### 2. Separate Middleware Files

```javascript
// middleware/seo.js
const prerenderMiddleware = (req, res, next) => {
  // ... middleware logic ...
  next();
};

module.exports = { prerenderMiddleware };
```

```javascript
// routes/seo.js
const express = require('express');
const router = express.Router();

// ... define routes ...

module.exports = router;
```

### 3. Clear Import Names

```javascript
// ❌ CONFUSING
const seo = require('./routes/seo');
app.use('/api/seo', seo.router);
```

```javascript
// ✅ CLEAR
const seoRouter = require('./routes/seo');
app.use('/api/seo', seoRouter);
```

### 4. Group Related Imports

```javascript
// server.js

// Middleware imports
const { prerenderMiddleware } = require('./middleware/seo');

// Route imports
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const seoRouter = require('./routes/seo');

// Apply middleware
app.use(prerenderMiddleware);

// Apply routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/seo', seoRouter);
```

---

## 🔧 PRODUCTION-READY STRUCTURE

### Recommended Folder Structure

```
server/
├── middleware/
│   ├── auth.js          → module.exports = { protect, authorize }
│   ├── checkPlan.js     → module.exports = { checkPlan }
│   └── seo.js           → module.exports = { prerenderMiddleware }
├── routes/
│   ├── auth.js          → module.exports = router
│   ├── users.js         → module.exports = router
│   ├── blog.js          → module.exports = router
│   └── seo.js           → module.exports = router
└── server.js
```

### server.js Template

```javascript
const express = require('express');
const app = express();

// ══════════════════════════════════════════════════════════
// MIDDLEWARE
// ══════════════════════════════════════════════════════════

const { prerenderMiddleware } = require('./middleware/seo');
const { protect } = require('./middleware/auth');

app.use(prerenderMiddleware);

// ══════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/seo', require('./routes/seo'));

// ══════════════════════════════════════════════════════════
// ERROR HANDLING
// ══════════════════════════════════════════════════════════

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

// ══════════════════════════════════════════════════════════
// REACT SPA FALLBACK (MUST BE LAST)
// ══════════════════════════════════════════════════════════

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

module.exports = app;
```

---

## ✅ VERIFICATION

After fixing, verify with:

```bash
# 1. Check syntax
node -c server/server.js

# 2. Check all route files
node -c server/routes/*.js

# 3. Test import
node -e "console.log(typeof require('./server/routes/seo'))"
# Should output: "function" (if direct export)
# Or: "object" (if you're handling it correctly)

# 4. Start server
npm start

# 5. Test endpoint
curl http://localhost:5000/api/seo/status
```

---

## 📊 SUMMARY

| Issue | Cause | Fix |
|-------|-------|-----|
| `Router.use() requires middleware function but got Object` | Exporting `{ router }` instead of `router` | Destructure: `require('./routes/seo').router` |
| Route not found | Wrong export pattern | Use `module.exports = router` |
| Middleware not working | Exporting as object property | Destructure: `const { middleware } = require(...)` |

---

## 🎓 KEY TAKEAWAYS

1. **Always export router directly:** `module.exports = router`
2. **Keep middleware separate** from route files when possible
3. **Use consistent patterns** across all route files
4. **Test imports** before deploying
5. **Check stack traces** to identify problematic lines
6. **Verify export types** with console.log during development

---

**Status:** ✅ FIXED
**Last Updated:** 2026-05-13
