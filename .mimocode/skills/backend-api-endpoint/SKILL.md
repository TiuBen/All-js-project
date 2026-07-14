---
name: backend-api-endpoint
description: Create new backend API endpoints with controllers, services, routes following the Express.js + SQLite pattern.
---

# Backend API Endpoint

This skill helps create new backend API endpoints following the project's established patterns for Express.js + SQLite.

## When to Use

- Adding new API endpoints
- Creating new controllers, services, or routes
- Implementing CRUD operations for new resources
- Adding business logic to existing endpoints

## Architecture Overview

### File Structure
```
packages/backend/full-web-backend/v4/
├── server.js           # Entry point
├── app.js              # Express app setup
├── routes/
│   ├── index.js        # Route registration
│   └── [resource].route.js
├── controllers/
│   ├── Base.Controller.js
│   └── [Resource].Controller.js
├── services/
│   ├── Base.Service.js
│   └── [Resource].Service.js
├── config/
│   ├── sqliteDb.js     # Database setup
│   └── CalculationRules.js
└── utils/
    ├── apiResponse.js  # Response helpers
    └── routeGenerator.js
```

### Request Flow
```
Route → Controller → Service → Database
```

## Step-by-Step Procedure

### 1. Create Service

```javascript
// services/[Resource].Service.js
const { SomeDb } = require('../config/sqliteDb');

class [Resource]Service {
  constructor() {
    this.db = SomeDb;
  }

  // GET all
  async findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM [table]';
      const params = [];
      
      // Add filters
      if (filters.field) {
        query += ' WHERE field = ?';
        params.push(filters.field);
      }
      
      query += ' ORDER BY id DESC';
      
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // GET by ID
  async findById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM [table] WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // POST create
  async create(data) {
    return new Promise((resolve, reject) => {
      const { field1, field2 } = data;
      const query = 'INSERT INTO [table] (field1, field2) VALUES (?, ?)';
      
      this.db.run(query, [field1, field2], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...data });
      });
    });
  }

  // PUT update
  async update(id, data) {
    return new Promise((resolve, reject) => {
      const { field1, field2 } = data;
      const query = 'UPDATE [table] SET field1 = ?, field2 = ? WHERE id = ?';
      
      this.db.run(query, [field1, field2, id], function(err) {
        if (err) reject(err);
        else resolve({ id, ...data });
      });
    });
  }

  // DELETE
  async delete(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM [table] WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ deleted: true });
      });
    });
  }
}

module.exports = new [Resource]Service();
```

### 2. Create Controller

```javascript
// controllers/[Resource].Controller.js
const [Resource]Service = require('../services/[Resource].Service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class [Resource]Controller {
  async findAll(req, res) {
    try {
      const filters = req.query;
      const data = await [Resource]Service.findAll(filters);
      res.json(successResponse(data));
    } catch (error) {
      res.status(500).json(errorResponse(error.message));
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;
      const data = await [Resource]Service.findById(id);
      if (!data) {
        return res.status(404).json(errorResponse('Not found'));
      }
      res.json(successResponse(data));
    } catch (error) {
      res.status(500).json(errorResponse(error.message));
    }
  }

  async create(req, res) {
    try {
      const data = req.body;
      const result = await [Resource]Service.create(data);
      res.status(201).json(successResponse(result));
    } catch (error) {
      res.status(500).json(errorResponse(error.message));
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const result = await [Resource]Service.update(id, data);
      res.json(successResponse(result));
    } catch (error) {
      res.status(500).json(errorResponse(error.message));
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await [Resource]Service.delete(id);
      res.json(successResponse({ deleted: true }));
    } catch (error) {
      res.status(500).json(errorResponse(error.message));
    }
  }
}

module.exports = new [Resource]Controller();
```

### 3. Create Routes

```javascript
// routes/[resource].route.js
const express = require('express');
const router = express.Router();
const [Resource]Controller = require('../controllers/[Resource].Controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

// GET all
router.get('/', authenticateToken, [Resource]Controller.findAll);

// GET by ID
router.get('/:id', authenticateToken, [Resource]Controller.findById);

// POST create
router.post('/', authenticateToken, requireAdmin, [Resource]Controller.create);

// PUT update
router.put('/:id', authenticateToken, requireAdmin, [Resource]Controller.update);

// DELETE
router.delete('/:id', authenticateToken, requireAdmin, [Resource]Controller.delete);

module.exports = router;
```

### 4. Register Route

```javascript
// routes/index.js
const express = require('express');
const router = express.Router();

// Import routes
const [resource]Routes = require('./[resource].route');

// Register routes
router.use('/api/[resource]', [resource]Routes);

// ... other routes

module.exports = router;
```

## Common Patterns

### Pattern: CRUD with Filters

```javascript
// Service with filters
async findAll(filters = {}) {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM [table]';
    const conditions = [];
    const params = [];

    if (filters.position) {
      conditions.push('position = ?');
      params.push(filters.position);
    }

    if (filters.dutyType) {
      conditions.push('dutyType = ?');
      params.push(filters.dutyType);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id DESC';

    this.db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
```

### Pattern: Complex Calculations

```javascript
// For compliance checking, statistics, etc.
async calculateCompliance(userId) {
  const duties = await this.findByUserId(userId);
  const now = dayjs();
  
  // Rule 1: Max 10h continuous
  const continuousHours = this.calculateContinuousHours(duties);
  
  // Rule 2: 24h cumulative
  const last24h = duties.filter(d => 
    dayjs(d.inTime).isAfter(now.subtract(24, 'hour'))
  );
  const cumulative24h = this.calculateTotalHours(last24h);
  
  // Rule 3: Weekly cumulative (40h)
  const weekStart = now.startOf('week');
  const weeklyDuties = duties.filter(d => 
    dayjs(d.inTime).isAfter(weekStart)
  );
  const weeklyHours = this.calculateTotalHours(weeklyDuties);
  
  return {
    continuousHours,
    cumulative24h,
    weeklyHours,
    compliant: continuousHours <= 10 && 
               cumulative24h <= 10 && 
               weeklyHours <= 40
  };
}
```

### Pattern: SSE (Server-Sent Events)

```javascript
// For real-time updates
const clients = new Map();

// Register client
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const clientId = Date.now();
  clients.set(clientId, res);

  req.on('close', () => {
    clients.delete(clientId);
  });
});

// Send event to all clients
function broadcast(event, data) {
  clients.forEach(client => {
    client.write(`event: ${event}\n`);
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

// Usage in controller
async create(req, res) {
  const result = await service.create(req.body);
  broadcast('resource-created', result);
  res.json(successResponse(result));
}
```

## Project-Specific Notes

### Database Setup

```javascript
// config/sqliteDb.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DutyDb = new sqlite3.Database(
  path.join(__dirname, '../src/test.db'),
  (err) => {
    if (err) console.error('DutyDb connection error:', err);
  }
);

const UserDb = new sqlite3.Database(
  path.join(__dirname, '../src/user-face.db'),
  (err) => {
    if (err) console.error('UserDb connection error:', err);
  }
);

module.exports = { DutyDb, UserDb };
```

### Response Format

```javascript
// utils/apiResponse.js
function successResponse(data, message = 'Success') {
  return {
    success: true,
    message,
    data
  };
}

function errorResponse(message = 'Error', code = null) {
  return {
    success: false,
    message,
    code
  };
}

module.exports = { successResponse, errorResponse };
```

### Authentication Middleware

```javascript
// middlewares/auth.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(errorResponse('Access denied'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json(errorResponse('Invalid token'));
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json(errorResponse('Admin access required'));
  }
  next();
}

module.exports = { authenticateToken, requireAdmin };
```

## Validation

After implementation:

1. Service methods work correctly with database
2. Controller handles requests and responses properly
3. Routes are registered and accessible
4. Authentication/authorization works
5. Response format matches project standards
6. No lint errors
