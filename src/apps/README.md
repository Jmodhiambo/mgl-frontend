## Color Themes
// theme.ts for Admin App
export const adminTheme = {
  background: {
    primary: '#0f172a',   // Slate 900 - main background
    secondary: '#1e293b', // Slate 800 - cards/panels
    tertiary: '#334155',  // Slate 700 - hover states
  },
  primary: {
    50: '#f8fafc',
    500: '#64748b',       // Slate 500 - muted elements
    600: '#475569',       // Slate 600 - borders
    700: '#334155',       // Slate 700 - active states
    900: '#0f172a',       // Slate 900 - backgrounds
  },
  accent: {
    danger: '#ef4444',    // Red 500 - delete, critical actions
    warning: '#f59e0b',   // Amber 500 - warnings
    success: '#10b981',   // Emerald 500 - approvals
    info: '#3b82f6',      // Blue 500 - info messages
  },
  text: {
    primary: '#f1f5f9',   // Slate 100 - main text
    secondary: '#cbd5e1', // Slate 300 - secondary text
    muted: '#94a3b8',     // Slate 400 - muted text
  }
}
```

---

## Alternative Options:

### **Option 2: Deep Purple/Violet 🟣**
- **Why**: Premium, powerful, enterprise feel
- **Examples**: Twilio Console, Auth0 Dashboard
- **Primary**: `#6d28d9` (Purple 700)
- **Use Case**: If you want something colorful but authoritative

### **Option 3: Charcoal with Emerald Accents 🖤💚**
- **Why**: Modern, clean, action-oriented
- **Examples**: Spotify Admin, Notion Admin
- **Primary**: `#111827` (Gray 900)
- **Accent**: `#10b981` (Emerald 500)

### **Option 4: Navy Blue 🔵**
- **Why**: Traditional enterprise, government-style authority
- **Examples**: Government portals, banking systems
- **Primary**: `#1e3a8a` (Blue 900)
- **Use Case**: If you want extreme professionalism

---

## Visual Hierarchy Summary:
```
🟠 User App (Orange)
└─ Purpose: Browse & buy tickets
└─ Feel: Fun, exciting, consumer-friendly
└─ Primary: #ea580c

🔵 Organizer App (Blue)  
└─ Purpose: Manage events & sales
└─ Feel: Professional, business-focused
└─ Primary: #2563eb

🖤 Admin App (Dark/Slate)
└─ Purpose: System administration & oversight
└─ Feel: Authoritative, powerful, system-level
└─ Primary: #0f172a (dark bg) + #ef4444 (red accents)
```

---

## Subdomains:
```
mgltickets.com           → User App (Orange)
organizer.mgltickets.com → Organizer App (Blue)
admin.mgltickets.com     → Admin App (Dark/Slate)