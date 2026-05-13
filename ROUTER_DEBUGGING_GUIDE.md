# 🔍 Express Router Debugging Guide

## 🎯 Quick Diagnosis Tool

Run this script to check all your route files:

```javascript
// debug-routes.js
const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'server', 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

console.log('═══════════════════════════════════════════════════════');
console.log('EXPRESS ROUTE FILE AUDIT');
console.log('═══════════════════════════════════════════════════════\n');

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  const exported = require(filePath);
  const type = typeof exported;
  const isRouter = type === 'function' && typeof exported.use === 'function';
  const isObject = type === 'object' && !isRouter;
  
  console.log(`📄 ${file}`);
  console.log(`   Type: ${type}`);
  console.log(`   Is Router: ${isRouter ? '✅' : '❌'}`);
  console.log(`   Is Object: ${isObject ? '⚠️  WARNING' : '✅'}`);
  
  if (isObject) {
    console.log(`   Keys: ${Object.keys(exported).join(', ')}`);
    console.log(`   ⚠️  This file exports an object, not a router!`);
    console.log(`   Fix: Use require('./${file}').router in server.js`);
  }
  
  console.log('');
});

console.log('═══════════════════════════════════════════════════════');
```

**Usage:**
```bash
node debug-routes.js
```

---

## 🚨 Common Error Messages & Solutions

### Error 1: "Router.use() requires a middleware function but got a Object"

**Cause:** Passing an object to `app.use()` instead of a router/middleware function

**Stack Trace Example:**
```
TypeError: Router.use() requires a middleware function but got a Object
    at Function.use (/node_modules/express/lib/router/index.js:469:13)
    at Function.<anonymous> (/node_modules/express/lib/application.js:227:21)
    at Object.<anonymous> (/server/server.js:200:5)
```

**Solution:**
```javascript
// ❌ BEFORE
app.use('/api/seo', require('./routes/seo'));

// ✅ AFTER
app.use('/api/seo', require('./routes/seo').router);
```

---

### Error 2: "Cannot read property 'use' of undefined"

**Cause:** Route file doesn't export anything or exports undefined

**Solution:**
```javascript
// Check route file has:
module.exports = router;  // At the end of the file
```

---

### Error 3: "Router.use() requires a middleware function but got a Array"

**Cause:** Exporting an array instead of a router

**Solution:**
```javascript
// ❌ WRONG
module.exports = [router, middleware];

// ✅ CORRECT
module.exports = router;
```

---

### Error 4: "Cannot find module './routes/seo'"

**Cause:** File doesn't exist or wrong path

**Solution:**
```bash
# Check file exists
ls server/routes/seo.js

# Check path in require()
# Should be relative to server.js location
```

---

## 🔧 Step-by-Step Debugging Process

### Step 1: Identify the Problematic Line

Look at the error stack trace:
```
at Object.<anonymous> (/server/server.js:200:5)
                                        ^^^
                                     Line 200
```

### Step 2: Check What's on That Line

```javascript
// server.js line 200
app.use('/api/seo', require('./routes/seo'));  // ← This line
```

### Step 3: Check the Route File Export

```javascript
// routes/seo.js - Check the LAST line
module.exports = ???  // What is exported?
```

### Step 4: Test the Export Type

Add temporary debug code:
```javascript
// server.js
const seoModule = require('./routes/seo');
console.log('═══════════════════════════════════════');
console.log('SEO Module Debug:');
console.log('Type:', typeof seoModule);
console.log('Is Function:', typeof seoModule === 'function');
console.log('Has .use():', typeof seoModule.use);
console.log('Keys:', Object.keys(seoModule));
console.log('═══════════════════════════════════════');
```

### Step 5: Fix Based on Output

**If output is:**
```
Type: object
Is Function: false
Has .use(): undefined
Keys: [ 'router', 'prerenderMiddleware' ]
```

**Then fix is:**
```javascript
app.use('/api/seo', seoModule.router);  // Use .router property
```

**If output is:**
```
Type: function
Is Function: true
Has .use(): function
Keys: []
```

**Then it's correct:**
```javascript
app.use('/api/seo', seoModule);  // Already correct
```

---

## 📋 Checklist for Each Route File

### ✅ Route File Checklist

```javascript
// routes/example.js

// 1. Import express
const express = require('express');  // ✅

// 2. Create router
const router = express.Router();  // ✅

// 3. Define routes
router.get('/', (req, res) => {  // ✅
  res.json({ message: 'Hello' });
});

// 4. Export router (MOST IMPORTANT!)
module.exports = router;  // ✅ MUST BE PRESENT
```

### ❌ Common Mistakes

```javascript
// ❌ MISTAKE 1: Forgot to export
const express = require('express');
const router = express.Router();
router.get('/', (req, res) => res.json({}));
// Missing: module.exports = router;

// ❌ MISTAKE 2: Exported wrong thing
module.exports = { router };  // Exports object, not router

// ❌ MISTAKE 3: Exported array
module.exports = [router];  // Exports array, not router

// ❌ MISTAKE 4: Exported function
module.exports = () => router;  // Exports function, not router

// ❌ MISTAKE 5: Typo in export
module.exports = ruter;  // Typo: 'ruter' instead of 'router'
```

---

## 🛠️ Automated Testing Script

Create this file to test all routes:

```javascript
// test-routes.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const routesDir = path.join(__dirname, 'server', 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

console.log('Testing route files...\n');

let errors = 0;
let warnings = 0;

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  const routeName = file.replace('.js', '');
  
  try {
    const exported = require(filePath);
    const type = typeof exported;
    const isRouter = type === 'function' && typeof exported.use === 'function';
    const isObject = type === 'object' && !isRouter;
    
    if (isRouter) {
      // Try to mount it
      try {
        app.use(`/test/${routeName}`, exported);
        console.log(`✅ ${file} - OK (Router)`);
      } catch (err) {
        console.log(`❌ ${file} - ERROR: ${err.message}`);
        errors++;
      }
    } else if (isObject) {
      console.log(`⚠️  ${file} - WARNING: Exports object, not router`);
      console.log(`   Keys: ${Object.keys(exported).join(', ')}`);
      
      if (exported.router) {
        try {
          app.use(`/test/${routeName}`, exported.router);
          console.log(`   ✅ Can use .router property`);
        } catch (err) {
          console.log(`   ❌ .router property is invalid: ${err.message}`);
          errors++;
        }
      } else {
        console.log(`   ❌ No .router property found`);
        errors++;
      }
      warnings++;
    } else {
      console.log(`❌ ${file} - ERROR: Invalid export type (${type})`);
      errors++;
    }
  } catch (err) {
    console.log(`❌ ${file} - ERROR: ${err.message}`);
    errors++;
  }
  
  console.log('');
});

console.log('═══════════════════════════════════════');
console.log(`Total files: ${files.length}`);
console.log(`Errors: ${errors}`);
console.log(`Warnings: ${warnings}`);
console.log(`Status: ${errors === 0 ? '✅ PASS' : '❌ FAIL'}`);
console.log('═══════════════════════════════════════');

process.exit(errors > 0 ? 1 : 0);
```

**Usage:**
```bash
node test-routes.js
```

---

## 🎯 Quick Fix Patterns

### Pattern 1: Object Export with Router

**Problem:**
```javascript
// routes/seo.js
module.exports = { router, middleware };
```

**Fix Option A:** Change export
```javascript
// routes/seo.js
module.exports = router;
module.exports.middleware = middleware;
```

**Fix Option B:** Change import
```javascript
// server.js
const { router, middleware } = require('./routes/seo');
app.use(middleware);
app.use('/api/seo', router);
```

**Fix Option C:** Use property
```javascript
// server.js
const seoModule = require('./routes/seo');
app.use(seoModule.middleware);
app.use('/api/seo', seoModule.router);
```

---

### Pattern 2: Multiple Exports

**Problem:**
```javascript
// routes/seo.js
const router = express.Router();
const helper = () => {};

module.exports = { router, helper };  // ❌
```

**Fix:**
```javascript
// routes/seo.js
const router = express.Router();
const helper = () => {};

module.exports = router;  // ✅ Default export
module.exports.helper = helper;  // ✅ Named export
```

**Usage:**
```javascript
// server.js
const seoRouter = require('./routes/seo');
app.use('/api/seo', seoRouter);  // ✅ Works

// If you need the helper:
const { helper } = require('./routes/seo');
```

---

### Pattern 3: Middleware + Router

**Problem:**
```javascript
// routes/seo.js
const router = express.Router();
const middleware = (req, res, next) => next();

module.exports = { router, middleware };  // ❌
```

**Best Fix:** Separate files
```javascript
// middleware/seo.js
const middleware = (req, res, next) => next();
module.exports = { middleware };

// routes/seo.js
const router = express.Router();
module.exports = router;
```

**Usage:**
```javascript
// server.js
const { middleware } = require('./middleware/seo');
const seoRouter = require('./routes/seo');

app.use(middleware);
app.use('/api/seo', seoRouter);
```

---

## 📊 Export Pattern Comparison

| Pattern | Pros | Cons | Recommended |
|---------|------|------|-------------|
| `module.exports = router` | Simple, works directly | Can't export other things easily | ✅ Yes |
| `module.exports = { router }` | Can export multiple things | Requires destructuring | ⚠️ Avoid |
| `module.exports = router; module.exports.helper = ...` | Clean, flexible | Slightly verbose | ✅ Yes |
| Separate files | Very clean, organized | More files | ✅ Best |

---

## 🔍 Debugging Commands

### Check Export Type
```bash
node -e "console.log(typeof require('./server/routes/seo'))"
```

### Check Export Keys
```bash
node -e "console.log(Object.keys(require('./server/routes/seo')))"
```

### Check if Router
```bash
node -e "const r = require('./server/routes/seo'); console.log(typeof r.use)"
```

### Test Import
```bash
node -e "const r = require('./server/routes/seo'); console.log('OK')"
```

### Check All Routes
```bash
for file in server/routes/*.js; do
  echo "Testing $file..."
  node -e "require('./$file')" && echo "✅ OK" || echo "❌ ERROR"
done
```

---

## 🎓 Learning Resources

### Understanding module.exports

```javascript
// These are equivalent:
module.exports = router;
exports = router;  // ❌ WRONG - doesn't work!

// Why? Because exports is a reference to module.exports
// Reassigning exports breaks the reference

// This works:
exports.router = router;  // ✅ Adds property to module.exports

// This doesn't:
exports = { router };  // ❌ Breaks reference
```

### Understanding Express Router

```javascript
const router = express.Router();

// Router is a function with special methods:
console.log(typeof router);  // "function"
console.log(typeof router.use);  // "function"
console.log(typeof router.get);  // "function"
console.log(typeof router.post);  // "function"

// app.use() expects a function with these methods
app.use('/api', router);  // ✅ Works
app.use('/api', { router });  // ❌ Doesn't work
```

---

## ✅ Final Checklist

Before deploying, verify:

- [ ] All route files export `module.exports = router`
- [ ] No route files export `{ router }`
- [ ] All `app.use()` calls receive routers, not objects
- [ ] Middleware is imported correctly
- [ ] No syntax errors in route files
- [ ] All routes are tested locally
- [ ] Debug code is removed
- [ ] Console.logs are removed

---

**Status:** Complete debugging guide
**Last Updated:** 2026-05-13
