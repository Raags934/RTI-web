# Angular Project Setup

## Environment
- **Angular CLI**: 20.3.11  
- **Node.js**: 20.19.4  
- **Package Manager**: npm 11.6.3  
- **OS**: Windows (win32 x64)

---

## Installation

Install Angular CLI globally:
```bash
npm install -g @angular/cli@20

src/
├── app/
│   ├── core/                          # App-wide singletons and utilities
│   │   ├── http/                      # Interceptors, API clients
│   │   ├── guards/                    # Route guards
│   │   ├── config/                    # App config, constants
│   │   └── core.module.ts            # Optional if grouping providers
│
│   ├── shared/                        # Reusable UI components and utilities
│   │   ├── ui/                        # Generic UI components
│   │   │   ├── sidebar/
│   │   │   ├── header-welcome/
│   │   │   ├── header-filter/
│   │   │   ├── table-header/
│   │   │   ├── table-filter/
│   │   │   ├── idea-table/
│   │   │   └── pagination/
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── shared.module.ts          # Optional
│
│   ├── features/                      # Feature-specific components
│   │   ├── dashboard-ideas/
│   │   │   ├── dashboard.component.ts
│   │   │   ├── state-panel/
│   │   │   ├── idea-create/
│   │   │   ├── idea-detail/
│   │   │   └── idea-routing.ts
│   │   ├── contact-support/
│   │   └── welcome-screen/
│
│   ├── state/                         # Signals/store logic
│   │   ├── ideas/
│   │   │   ├── ideas.store.ts
│   │   │   ├── ideas.service.ts       # Business logic for ideas
│   │   │   └── ideas.selectors.ts
│   │   ├── events/
│   │   │   ├── events.store.ts
│   │   │   ├── events.service.ts
│   │   │   └── events.selectors.ts
│   │   └── state.module.ts           # Optional
│
│   ├── models/                        # TypeScript interfaces
│   │   ├── idea.ts
│   │   ├── event.ts
│   │   └── user.ts
│
│   ├── assets/                        # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│
│   ├── environments/                 # Angular env files
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│
│   └── app.config.ts                 # Standalone app config
