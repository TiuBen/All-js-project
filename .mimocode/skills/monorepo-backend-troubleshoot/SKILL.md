---
name: monorepo-backend-troubleshoot
description: Diagnose and fix backend startup failures in monorepo projects, especially missing dependencies, native module issues, and package.json problems.
---

# Monorepo Backend Troubleshoot

This skill helps diagnose and fix backend startup failures in monorepo projects, particularly when a sub-package (like v4) can't start due to missing dependencies, broken native modules, or configuration issues.

## When to Use

- Backend server crashes on startup with "module not found" errors
- Native modules (sqlite3, sharp, etc.) fail to load in monorepo context
- package.json is empty or missing dependencies
- Workarounds needed for broken build tools or environments

## Step-by-Step Procedure

### 1. Identify the Problem

```bash
# Try to start the server and capture the error
node server.js

# Check if the error is about missing modules
# Common patterns:
# - "Cannot find module 'X'"
# - "Could not locate the bindings file" (native modules)
# - "Error: Cannot find module './app'"
```

### 2. Check package.json

```bash
# Read the package.json in the backend directory
# Look for missing dependencies
# Common missing packages in Express.js projects:
# - express, cors, body-parser, cookie-parser
# - sqlite3, jsonwebtoken, dayjs, node-cache, exceljs
# - http-errors, uuid
```

### 3. Verify Dependencies Installation

```bash
# Check if node_modules exists in the backend directory
ls node_modules

# Check if the dependency is in node_modules
ls node_modules | grep express

# Check monorepo root node_modules
ls ../../node_modules | grep express
```

### 4. Fix Native Module Issues

For native modules like `sqlite3`:

```bash
# Check if the native binding exists
ls node_modules/sqlite3/lib/binding

# If missing, rebuild or reinstall
npm rebuild sqlite3

# Or reinstall with build tools
npm install sqlite3 --build-from-source
```

### 5. Fix package.json Dependencies

Add all required dependencies to package.json:

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "body-parser": "^1.20.0",
    "cookie-parser": "^1.4.6",
    "sqlite3": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "dayjs": "^1.11.0",
    "node-cache": "^5.1.2",
    "exceljs": "^4.3.0",
    "http-errors": "^2.0.0",
    "uuid": "^9.0.0"
  }
}
```

### 6. Handle ESM/CJS Compatibility

If a file uses ESM syntax (`import`/`export`) but the project is CJS:

Option A: Convert to CJS
```javascript
// Change from:
import { v4 as uuidv4 } from "uuid";
export async function myFunc() {}

// To:
const { v4: uuidv4 } = require("uuid");
async function myFunc() {}
module.exports = { myFunc };
```

Option B: Add "type": "module" to package.json (if all files use ESM)

### 7. Test the Fix

```bash
# Try starting the server again
node server.js

# Verify the endpoint works
curl http://localhost:3205/api/health
```

## Common Issues and Solutions

### Issue: "Could not locate the bindings file" for sqlite3

**Cause**: Native module not compiled or missing binary.

**Solution**:
1. Install build tools (node-gyp, python, Visual Studio Build Tools)
2. Run `npm rebuild sqlite3`
3. Or use `better-sqlite3` as alternative

### Issue: "Cannot find module 'X'" in monorepo

**Cause**: Dependency not installed or not hoisted to root.

**Solution**:
1. Add dependency to sub-package's package.json
2. Run `npm install` in the sub-package directory
3. Or run `npm install` at monorepo root

### Issue: ESM/CJS syntax error

**Cause**: File uses `import`/`export` but project is CommonJS.

**Solution**:
1. Convert to `require()`/`module.exports`
2. Or add `"type": "module"` to package.json
3. Or rename file to `.mjs`

### Issue: pip/SSL errors on Windows

**Cause**: Corporate proxy or SSL certificate issues.

**Solution**:
```python
# Download wheels manually
import urllib.request
import ssl

context = ssl.create_default_context()
context.check_hostname = False
context.verify_mode = ssl.CERT_NONE

# Download and install
urllib.request.urlretrieve(url, filename)
subprocess.run(["pip", "install", "--no-deps", "--no-index", filename])
```

## Project-Specific Notes

For the ATC duty management system:

- Backend is at `D:\GitHub\All-js-project\packages\backend\full-web-backend\v4`
- Uses SQLite with `sqlite3` native module
- Server runs on port 3205
- Key files: `server.js`, `app.js`, `config/sqliteDb.js`

## Validation

After applying fixes:

1. Server starts without errors
2. API endpoints respond correctly
3. Database connections work
4. No module not found errors in logs
