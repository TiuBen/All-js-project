---
name: frontend-zustand-pattern
description: Create or modify Zustand stores, services, and React components following the project's established patterns.
---

# Frontend Zustand Pattern

This skill helps create or modify Zustand stores, services, and React components following the project's established patterns for the ATC duty management frontend.

## When to Use

- Creating new Zustand stores
- Adding new API service functions
- Connecting components to stores
- Migrating from old patterns (useSWR, API_URL) to new patterns

## Architecture Overview

### Data Flow Pattern
```
Component → Store → Service → HTTP → Backend API
```

### File Structure
```
src/
├── service/          # API service layer
│   ├── http.js       # Axios instance with auth
│   ├── user.service.js
│   ├── duty.service.js
│   └── position.service.js
├── store/            # Zustand state management
│   ├── app.store.js
│   ├── user.store.js
│   ├── duty.store.js
│   └── dialog.store.js
└── pages/
    └── [Page]/
        └── [Component].jsx
```

## Step-by-Step Procedure

### 1. Create or Update Service

```javascript
// src/service/[resource].service.js
import http from './http';

export const resourceService = {
  // GET all
  async list() {
    const { data } = await http.get('/api/[resource]');
    return data;
  },

  // GET by ID
  async getById(id) {
    const { data } = await http.get(`/api/[resource]/${id}`);
    return data;
  },

  // POST create
  async create(payload) {
    const { data } = await http.post('/api/[resource]', payload);
    return data;
  },

  // PUT update
  async update(id, payload) {
    const { data } = await http.put(`/api/[resource]/${id}`, payload);
    return data;
  },

  // DELETE
  async delete(id) {
    const { data } = await http.delete(`/api/[resource]/${id}`);
    return data;
  }
};
```

### 2. Create or Update Zustand Store

```javascript
// src/store/[resource].store.js
import { create } from 'zustand';
import { resourceService } from '../service/[resource].service';

export const useResourceStore = create((set, get) => ({
  // State
  items: [],
  selectedItem: null,
  loading: false,
  error: null,

  // Actions
  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const items = await resourceService.list();
      set({ items, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchById: async (id) => {
    set({ loading: true, error: null });
    try {
      const item = await resourceService.getById(id);
      set({ selectedItem: item, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createItem: async (payload) => {
    set({ loading: true, error: null });
    try {
      const newItem = await resourceService.create(payload);
      set((state) => ({
        items: [...state.items, newItem],
        loading: false
      }));
      return newItem;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateItem: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const updated = await resourceService.update(id, payload);
      set((state) => ({
        items: state.items.map(item =>
          item.id === id ? updated : item
        ),
        selectedItem: updated,
        loading: false
      }));
      return updated;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteItem: async (id) => {
    set({ loading: true, error: null });
    try {
      await resourceService.delete(id);
      set((state) => ({
        items: state.items.filter(item => item.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Utility actions
  setSelectedItem: (item) => set({ selectedItem: item }),
  clearError: () => set({ error: null })
}));
```

### 3. Create Dialog Store (for modals)

```javascript
// src/store/dialog.store.js
import { create } from 'zustand';

export const useDialogStore = create((set) => ({
  // State
  isOpen: false,
  mode: 'add', // 'add' | 'edit' | 'view'
  record: null,

  // Actions
  openDialog: (mode = 'add', record = null) => set({
    isOpen: true,
    mode,
    record
  }),

  closeDialog: () => set({
    isOpen: false,
    mode: 'add',
    record: null
  }),

  // Convenience methods
  openAddDialog: () => set({
    isOpen: true,
    mode: 'add',
    record: null
  }),

  openEditDialog: (record) => set({
    isOpen: true,
    mode: 'edit',
    record
  }),

  openViewDialog: (record) => set({
    isOpen: true,
    mode: 'view',
    record
  })
}));
```

### 4. Connect Component to Store

```jsx
// src/pages/[Page]/[Component].jsx
import { useEffect } from 'react';
import { useResourceStore } from '../../store/[resource].store';
import { useDialogStore } from '../../store/dialog.store';

export function MyComponent() {
  const { items, loading, error, fetchItems, deleteItem } = useResourceStore();
  const { openAddDialog, openEditDialog } = useDialogStore();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAdd = () => {
    openAddDialog();
  };

  const handleEdit = (record) => {
    openEditDialog(record);
  };

  const handleDelete = async (id) => {
    if (confirm('确定删除？')) {
      await deleteItem(id);
    }
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      <button onClick={handleAdd}>添加</button>
      <table>
        <thead>
          <tr>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>
                <button onClick={() => handleEdit(item)}>编辑</button>
                <button onClick={() => handleDelete(item.id)}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Common Patterns

### Pattern: Position → Seat → Staff Structure

For pages with hierarchical data (like OnDutyPage):

```javascript
// Filter by position, then seat, then staff
const filteredRecords = records.filter(record => {
  return (
    record.position === selectedPosition &&
    record.seat === selectedSeat
  );
});
```

### Pattern: Role-based Filtering

```javascript
// Filter by 主班/副班 (main/sub)
const mainRecords = records.filter(r => r.roleType !== '副班');
const subRecords = records.filter(r => r.roleType === '副班');
```

### Pattern: Drag-and-Drop Sorting

For sortable lists (like TeamSettingPage):

```javascript
// Track drag source
const [dragSource, setDragSource] = useState(null);

// Handle drag start
const handleDragStart = (e, item, source) => {
  setDragSource(source);
  e.dataTransfer.setData('text/plain', JSON.stringify(item));
};

// Handle drop
const handleDrop = (e, targetZone) => {
  const item = JSON.parse(e.dataTransfer.getData('text/plain'));
  
  if (dragSource === 'all') {
    // Reorder within "全体成员" zone
    updateRank(item.id, newRank);
  } else {
    // Move between zones
    updateTeam(item.id, targetZone);
  }
};
```

## Migration from Old Patterns

### From useSWR to Zustand

Old pattern:
```javascript
import useSWR from 'swr';
import { FETCHER, SERVER_URL } from '@utils';

const { data, error, isLoading } = useSWR(`${SERVER_URL}/api/users`, FETCHER);
```

New pattern:
```javascript
import { useUserStore } from '../../store/user.store';

const { users, loading, error, fetchUsers } = useUserStore();

useEffect(() => {
  fetchUsers();
}, [fetchUsers]);
```

### From API_URL Constants to Service Layer

Old pattern:
```javascript
import { API_URL } from '@utils';

fetch(`${API_URL.user}/${id}`)
```

New pattern:
```javascript
import { userService } from '../service/user.service';

const user = await userService.getById(id);
```

## Project-Specific Notes

- UI library: `@radix-ui/themes` (NOT `@radix-ui/react-dialog`)
- Use `Dialog` from `@radix-ui/themes` for modal dialogs
- State management: Zustand (NOT Redux, NOT Context API)
- HTTP client: Axios with auto-attach Bearer token
- Auto-redirect to `/login` on 401 responses

## Validation

After implementation:

1. Store is created and exports correct actions
2. Service functions call correct API endpoints
3. Component imports and uses store correctly
4. No lint errors
5. Data flows correctly from API → Store → Component
