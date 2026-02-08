# PostgreSQL + NestJS Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     NestJS Application                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Controllers Layer (API)                      │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │  UsersController                                    │  │ │
│  │  │  - GET    /users                                    │  │ │
│  │  │  - GET    /users/:id                                │  │ │
│  │  │  - POST   /users                                    │  │ │
│  │  │  - PUT    /users/:id                                │  │ │
│  │  │  - DELETE /users/:id                                │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                            ↓ HTTP Requests                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Services Layer (Business Logic)             │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │  UsersService                                       │  │ │
│  │  │  - findAll()                                        │  │ │
│  │  │  - findOne(id)                                      │  │ │
│  │  │  - create(userData)                                 │  │ │
│  │  │  - update(id, userData)                             │  │ │
│  │  │  - remove(id)                                       │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                            ↓ Business Logic                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              TypeORM Layer (ORM)                         │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │  Repository<User>                                   │  │ │
│  │  │  - find()                                           │  │ │
│  │  │  - findOne()                                        │  │ │
│  │  │  - save()                                           │  │ │
│  │  │  - update()                                         │  │ │
│  │  │  - delete()                                         │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                            ↓ SQL Queries                       │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Table: users                                            │ │
│  │  ┌─────────────┬──────────────┬──────────────────────┐   │ │
│  │  │ Column      │ Type         │ Constraints          │   │ │
│  │  ├─────────────┼──────────────┼──────────────────────┤   │ │
│  │  │ id          │ UUID         │ PRIMARY KEY          │   │ │
│  │  │ email       │ VARCHAR      │ UNIQUE, NOT NULL     │   │ │
│  │  │ name        │ VARCHAR      │ NOT NULL             │   │ │
│  │  │ phone       │ VARCHAR      │ NULLABLE             │   │ │
│  │  │ isActive    │ BOOLEAN      │ DEFAULT true         │   │ │
│  │  │ createdAt   │ TIMESTAMP    │ DEFAULT NOW()        │   │ │
│  │  │ updatedAt   │ TIMESTAMP    │ DEFAULT NOW()        │   │ │
│  │  └─────────────┴──────────────┴──────────────────────┘   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Database: business_saas_db                                    │
│  Host: localhost                                               │
│  Port: 5432                                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Configuration                              │
│                                                                 │
│  .env                           typeorm.config.ts              │
│  ├─ DB_HOST=localhost           ├─ Database connection         │
│  ├─ DB_PORT=5432                ├─ Entity auto-loading         │
│  ├─ DB_USERNAME=postgres        ├─ Synchronization settings    │
│  ├─ DB_PASSWORD=***             └─ Logging configuration       │
│  └─ DB_DATABASE=business_saas_db                               │
│                                                                 │
│                    ↓ (Configuration feeds into)                │
│                  TypeORM & NestJS Modules                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Request Flow Example                       │
│                                                                 │
│  1. Client → POST /users { email, name, phone }                │
│     ↓                                                           │
│  2. UsersController.create() receives request                  │
│     ↓                                                           │
│  3. UsersService.create() processes business logic             │
│     ↓                                                           │
│  4. Repository<User>.save() executes                           │
│     ↓                                                           │
│  5. TypeORM generates SQL: INSERT INTO users ...               │
│     ↓                                                           │
│  6. PostgreSQL executes query and returns new user             │
│     ↓                                                           │
│  7. Response flows back up through layers                      │
│     ↓                                                           │
│  8. Client ← 201 Created { id, email, name, ... }              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Module Structure                           │
│                                                                 │
│  AppModule (Root)                                              │
│  ├─ ConfigModule (Environment variables)                       │
│  ├─ TypeOrmModule (Database connection)                        │
│  └─ UsersModule                                                │
│     ├─ UsersController (HTTP endpoints)                        │
│     ├─ UsersService (Business logic)                           │
│     └─ TypeOrmModule.forFeature([User]) (Entity registration)  │
└─────────────────────────────────────────────────────────────────┘
