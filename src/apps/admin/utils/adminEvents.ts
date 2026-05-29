// src/apps/admin/utils/adminEvents.ts
// ─────────────────────────────────────────────────────────────────────────────
// Lightweight event bus for cross-component badge coordination.
// Any component can emit an event; AdminLayout listens and re-fetches badges.
//
// Usage — emit:
//   import { adminEvents } from '@admin/utils/adminEvents';
//   adminEvents.emit('badges:refresh');
//
// Usage — listen (in AdminLayout):
//   adminEvents.on('badges:refresh', fetchBadges);
//   return () => adminEvents.off('badges:refresh', fetchBadges);
// ─────────────────────────────────────────────────────────────────────────────

type AdminEventType = 'badges:refresh';

type Listener = () => void;

class AdminEventBus {
  private listeners: Map<AdminEventType, Set<Listener>> = new Map();

  on(event: AdminEventType, listener: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
  }

  off(event: AdminEventType, listener: Listener) {
    this.listeners.get(event)?.delete(listener);
  }

  emit(event: AdminEventType) {
    this.listeners.get(event)?.forEach(l => l());
  }
}

// Singleton — same instance across the whole app
export const adminEvents = new AdminEventBus();