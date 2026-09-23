# Graph Report - medsos  (2026-09-23)

## Corpus Check
- 225 files · ~87,525 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 18 file(s) not represented in the graph (top: (none) 8, .css 3, .exe 2)

## Summary
- 1169 nodes · 4177 edges · 60 communities (50 shown, 10 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 121 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Auth & Account DTOs/Controllers
- Admin Dashboard Render Helpers
- Auth Service Helpers
- Frontend Build Config & Dependencies
- Core Feed/Header/Jobs Components
- Network/Post API Clients & Modals
- Backend Tests (Rate Limit & Link Preview)
- Auth/User API & Navigation Components
- Core Domain Models
- User & Network Repository/Service Layer
- Post Repository & Feed Data
- App Shell, Login/Signup & Admin Settings
- Goravel Service Providers Bootstrap
- Frontend API Clients (Admin/Job/Message)
- Goravel Core Facades
- Controller Constructors & Middleware
- Frontend Package Dependencies
- Goravel Facade Accessors
- Auth DTOs, Roles & Middleware
- Link Preview Fetch Job & Lang Facade
- Messaging Controller & Repository
- Post Creation & Notification Helpers
- OAuth Login Flow
- Project Docs & Local Setup Scripts
- TypeScript Config
- Portfolio Feature (Controller/Repo/Service)
- Job Posting Feature (Controller/Repo)
- App Bootstrap & GRPC
- Config Facade Registration
- HTTP/Process/RateLimiter/Session Facades
- Modern App Shell Components
- Database Schema & Migrations
- Post Service Business Logic
- Frontend Mock Data & Types
- frontend/view AI Studio App Dependencies
- Auth/Hash/Mail Facade Registration
- DB/Testing/Cache Facade Registration
- Gate/Seeder/CORS Facade Registration
- Cache/GRPC/Database Facade Registration
- Route/Schedule/Gin HTTP Facades
- Session/Storage/JWT Facade Registration
- Network Connections Feature
- Frontend Dev Tooling Dependencies
- Ad-hoc Python Dashboard Scripts
- Queue/Jobs Facade & main.go
- NPM Scripts
- Vite Config
- Env Config Loading
- Mail Facade
- Validation Facade
- Default Template Readmes & Logos
- K6 Load Test Script
- Artisan CLI Script
- Social Icon Sprite
- Goravel Binary Entry

## God Nodes (most connected - your core abstractions)
1. `Attr` - 78 edges
2. `Element` - 59 edges
3. `RenderBeranda()` - 51 edges
4. `RenderProfile()` - 47 edges
5. `RenderDashboardAdminPengaturanSistem()` - 45 edges
6. `User` - 44 edges
7. `RenderDashboardAdminIkhtisar()` - 44 edges
8. `RenderDashboardAdminManajemenPengguna()` - 44 edges
9. `authenticatedUserID()` - 43 edges
10. `RenderRegister()` - 43 edges

## Surprising Connections (you probably didn't know these)
- `init()` --calls--> `Config()`  [EXTRACTED]
  config/cache.go → app/facades/config.go
- `init()` --calls--> `Config()`  [EXTRACTED]
  config/cors.go → app/facades/config.go
- `init()` --calls--> `Config()`  [EXTRACTED]
  config/grpc.go → app/facades/config.go
- `init()` --calls--> `Config()`  [EXTRACTED]
  config/jwt.go → app/facades/config.go
- `init()` --calls--> `Config()`  [EXTRACTED]
  config/logging.go → app/facades/config.go

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Connect Modern documentation suite (index + setup + requirements + providers + checklist)** — doc_readme_doc, local_setup_doc, doc_requirements_status_doc, doc_external_providers_doc, doc_production_checklist_doc [EXTRACTED 0.95]
- **Duplicate frontend scaffolds coexisting in repo (Vite+React Connect Modern app vs leftover AI Studio boilerplate)** — frontend_readme_doc, frontend_index_doc, frontend_view_readme_doc, frontend_view_index_doc [INFERRED 0.75]
- **Connect Modern purple cube brand visual identity** — frontend_public_favicon_svg, frontend_src_assets_hero_png, frontend_index_doc [INFERRED 0.75]

## Communities (60 total, 10 thin omitted)

### Community 0 - "Auth & Account DTOs/Controllers"
Cohesion: 0.12
Nodes (48): LinkPreviewRequest, go_pkg_bytes, go_pkg_context, go_pkg_crypto_rand, go_pkg_crypto_sha256, go_pkg_database_sql, go_pkg_encoding_base64, go_pkg_encoding_hex (+40 more)

### Community 1 - "Admin Dashboard Render Helpers"
Cohesion: 0.12
Nodes (108): LoginData, RegisterData, Attr, GroupNode, Raw, Text, io.Writer, RenderBeranda() (+100 more)

### Community 2 - "Auth Service Helpers"
Cohesion: 0.06
Nodes (30): dbTransactionResponse(), findUserByTarget(), issueCode(), nullableString(), randomCode(), routeID(), verifyCode(), authenticatedUserID() (+22 more)

### Community 3 - "Frontend Build Config & Dependencies"
Cohesion: 0.05
Nodes (45): dependencies, axios, lucide-react, motion, react, react-dom, react-router-dom, devDependencies (+37 more)

### Community 4 - "Core Feed/Header/Jobs Components"
Cohesion: 0.11
Nodes (30): Feed(), FeedProps, Header(), HeaderProps, Jobs(), Login(), LoginProps, Messages() (+22 more)

### Community 5 - "Network/Post API Clients & Modals"
Cohesion: 0.13
Nodes (25): networkApi, postApi, AddPortfolioModal(), AddPortfolioModalProps, CreatePostModal(), CreatePostModalProps, CreatePostPayload, parseTags() (+17 more)

### Community 6 - "Backend Tests (Rate Limit & Link Preview)"
Cohesion: 0.07
Nodes (29): TestFixedWindowLimiterIsSafeUnderConcurrentLoad(), TestFixedWindowLimiterRejectsAndResets(), TestFetchLinkPreviewRetriesAreBounded(), TestFetchLinkPreviewUpdatesQueuedLink(), ExampleTestSuite, fileContract, go_pkg_github_com_goravel_framework_contracts_filesystem, go_pkg_github_com_stretchr_testify_assert (+21 more)

### Community 7 - "Auth/User API & Navigation Components"
Cohesion: 0.13
Nodes (21): authApi, userApi, Navbar(), Sidebar(), ProfileHeader(), AuthContext, AuthProvider(), useAuth() (+13 more)

### Community 8 - "Core Domain Models"
Cohesion: 0.06
Nodes (29): User, Post, User, User, adminReportResponse, sync.Mutex, time.Duration, time.Time (+21 more)

### Community 9 - "User & Network Repository/Service Layer"
Cohesion: 0.11
Nodes (6): User, PostComment, UserRepository, UserService, NetworkRepositoryImpl, userRepo

### Community 10 - "Post Repository & Feed Data"
Cohesion: 0.12
Nodes (12): Post, PostComment, User, PostRepository, postPreloads(), sanitizePostUsers(), BerandaData, ProfileData (+4 more)

### Community 11 - "App Shell, Login/Signup & Admin Settings"
Cohesion: 0.10
Nodes (14): App(), Login(), LoginProps, Signup(), SignupProps, LinkPreviewCard(), PostCard(), PostForm() (+6 more)

### Community 12 - "Goravel Service Providers Bootstrap"
Cohesion: 0.09
Nodes (22): Providers(), go_pkg_github_com_goravel_framework_auth, go_pkg_github_com_goravel_framework_cache, go_pkg_github_com_goravel_framework_crypt, go_pkg_github_com_goravel_framework_database, go_pkg_github_com_goravel_framework_event, go_pkg_github_com_goravel_framework_filesystem, go_pkg_github_com_goravel_framework_grpc (+14 more)

### Community 13 - "Frontend API Clients (Admin/Job/Message)"
Cohesion: 0.13
Nodes (12): adminApi, api, jobApi, messageApi, socialApi, AdminModerationTab(), AdminOverviewTab(), AdminUsersTab() (+4 more)

### Community 14 - "Goravel Core Facades"
Cohesion: 0.17
Nodes (10): Orm(), init(), go_pkg_github_com_goravel_framework_contracts_console, go_pkg_github_com_goravel_framework_contracts_crypt, go_pkg_github_com_goravel_framework_contracts_database_orm, go_pkg_github_com_goravel_framework_contracts_event, go_pkg_github_com_goravel_framework_contracts_log, go_pkg_github_com_goravel_framework_contracts_translation (+2 more)

### Community 15 - "Controller Constructors & Middleware"
Cohesion: 0.17
Nodes (20): GetLocalStorageService(), NewAccountController(), NewAuthController(), NewPostController(), NewSocialController(), NewUserController(), AdminMiddleware(), AuthMiddleware() (+12 more)

### Community 16 - "Frontend Package Dependencies"
Cohesion: 0.10
Nodes (20): autoprefixer, lucide-react, motion, react, react-dom, tailwindcss, vite, @vitejs/plugin-react (+12 more)

### Community 17 - "Goravel Facade Accessors"
Cohesion: 0.11
Nodes (18): App(), Artisan(), Cache(), Crypt(), Event(), Http(), Log(), Route() (+10 more)

### Community 18 - "Auth DTOs, Roles & Middleware"
Cohesion: 0.16
Nodes (14): AuthResponse, LoginRequest, RefreshRequest, RegisterRequest, RoleMiddleware(), UserRole, normalizeUsername(), Claims (+6 more)

### Community 19 - "Link Preview Fetch Job & Lang Facade"
Cohesion: 0.12
Nodes (13): Lang(), context.Context, github.com/goravel/framework/contracts/translation.Translator, net.Conn, net.IP, FetchLinkPreview, FallbackPreview(), FetchPreview() (+5 more)

### Community 20 - "Messaging Controller & Repository"
Cohesion: 0.15
Nodes (9): NewMessageController(), Conversation, User, Message, User, MessageRepository, NewMessageRepository(), Conversation (+1 more)

### Community 21 - "Post Creation & Notification Helpers"
Cohesion: 0.14
Nodes (15): CreatePostRequest, Queue(), createMentionNotifications(), enqueueLinkPreview(), normalizedUnique(), normalizeHashtags(), normalizeMentions(), optional() (+7 more)

### Community 22 - "OAuth Login Flow"
Cohesion: 0.21
Nodes (12): identityFromJWT(), NewOAuthController(), normalizeOAuthUsername(), oauthRedirect(), providerConfig(), randomURLToken(), sha256Hex(), upsertOAuthUser() (+4 more)

### Community 23 - "Project Docs & Local Setup Scripts"
Cohesion: 0.15
Nodes (16): Connect Modern (product/app name), Goravel Framework, start-local.ps1 (local backend/frontend bootstrap script), stop-local.ps1 (stops background local server), doc/EXTERNAL_PROVIDERS.md — External Provider Configuration, doc/PRODUCTION_CHECKLIST.md — Production Readiness Checklist, doc/README.md — Connect Modern Documentation Index, doc/REQUIREMENTS_STATUS.md — Functional Requirements Status (+8 more)

### Community 24 - "TypeScript Config"
Cohesion: 0.12
Nodes (15): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+7 more)

### Community 25 - "Portfolio Feature (Controller/Repo/Service)"
Cohesion: 0.18
Nodes (8): CreatePortfolioRequest, NewPortfolioController(), Portfolio, User, PortfolioRepository, NewPortfolioRepository(), PortfolioService, NewPortfolioService()

### Community 26 - "Job Posting Feature (Controller/Repo)"
Cohesion: 0.14
Nodes (9): NewJobController(), User, JobPosting, User, JobRepository, NewJobRepository(), JobController, JobApplication (+1 more)

### Community 27 - "App Bootstrap & GRPC"
Cohesion: 0.21
Nodes (8): Boot(), init(), go_pkg_github_com_goravel_framework_contracts_foundation, go_pkg_github_com_goravel_framework_foundation, go_pkg_github_com_goravel_framework_testing, github.com/goravel/framework/contracts/foundation.Application, Grpc(), init()

### Community 28 - "Config Facade Registration"
Cohesion: 0.17
Nodes (11): Config(), init(), init(), init(), init(), init(), init(), init() (+3 more)

### Community 29 - "HTTP/Process/RateLimiter/Session Facades"
Cohesion: 0.19
Nodes (8): Process(), RateLimiter(), go_pkg_github_com_goravel_framework_contracts_http_client, go_pkg_github_com_goravel_framework_contracts_process, go_pkg_github_com_goravel_framework_support_path, go_pkg_github_com_goravel_framework_support_str, github.com/goravel/framework/contracts/http.RateLimiter, github.com/goravel/framework/contracts/process.Process

### Community 30 - "Modern App Shell Components"
Cohesion: 0.15
Nodes (11): ref_components_feed, ref_components_header, ref_components_jobs, ref_components_login, ref_components_messages, ref_components_network, ref_components_profile, ref_components_rightsidebar (+3 more)

### Community 31 - "Database Schema & Migrations"
Cohesion: 0.23
Nodes (6): Schema(), Migrations(), go_pkg_github_com_goravel_framework_contracts_database_schema, github.com/goravel/framework/contracts/database/schema.Migration, github.com/goravel/framework/contracts/database/schema.Schema, M20210101000001CreateJobsTable

### Community 32 - "Post Service Business Logic"
Cohesion: 0.18
Nodes (4): PostComment, Post, User, PostService

### Community 33 - "Frontend Mock Data & Types"
Cohesion: 0.22
Nodes (8): initialPosts, mockJobs, mockUsers, ChatMessage, Comment, Conversation, Job, LinkPreview

### Community 34 - "frontend/view AI Studio App Dependencies"
Cohesion: 0.18
Nodes (11): dependencies, dotenv, express, @google/genai, lucide-react, motion, react, react-dom (+3 more)

### Community 35 - "Auth/Hash/Mail Facade Registration"
Cohesion: 0.20
Nodes (7): Auth(), Hash(), init(), go_pkg_github_com_goravel_framework_contracts_auth, go_pkg_github_com_goravel_framework_contracts_hash, github.com/goravel/framework/contracts/auth.Auth, github.com/goravel/framework/contracts/hash.Hash

### Community 36 - "DB/Testing/Cache Facade Registration"
Cohesion: 0.20
Nodes (7): DB(), Testing(), init(), go_pkg_github_com_goravel_framework_contracts_database_db, go_pkg_github_com_goravel_framework_contracts_testing, github.com/goravel/framework/contracts/database/db.DB, github.com/goravel/framework/contracts/testing.Testing

### Community 37 - "Gate/Seeder/CORS Facade Registration"
Cohesion: 0.20
Nodes (7): Gate(), Seeder(), init(), go_pkg_github_com_goravel_framework_contracts_auth_access, go_pkg_github_com_goravel_framework_contracts_database_seeder, github.com/goravel/framework/contracts/auth/access.Gate, github.com/goravel/framework/contracts/database/seeder.Facade

### Community 38 - "Cache/GRPC/Database Facade Registration"
Cohesion: 0.22
Nodes (6): Grpc(), go_pkg_github_com_goravel_framework_contracts_cache, go_pkg_github_com_goravel_framework_contracts_database_driver, go_pkg_github_com_goravel_framework_contracts_grpc, go_pkg_github_com_goravel_mysql_facades, github.com/goravel/framework/contracts/grpc.Grpc

### Community 39 - "Route/Schedule/Gin HTTP Facades"
Cohesion: 0.25
Nodes (6): Schedule(), go_pkg_github_com_gin_gonic_gin_render, go_pkg_github_com_goravel_framework_contracts_route, go_pkg_github_com_goravel_framework_contracts_schedule, go_pkg_github_com_goravel_gin_facades, github.com/goravel/framework/contracts/schedule.Schedule

### Community 40 - "Session/Storage/JWT Facade Registration"
Cohesion: 0.22
Nodes (6): Session(), Storage(), init(), go_pkg_github_com_goravel_framework_contracts_session, github.com/goravel/framework/contracts/filesystem.Storage, github.com/goravel/framework/contracts/session.Manager

### Community 41 - "Network Connections Feature"
Cohesion: 0.22
Nodes (3): NewNetworkController(), NetworkRepository, NewNetworkRepository()

### Community 42 - "Frontend Dev Tooling Dependencies"
Cohesion: 0.22
Nodes (9): devDependencies, autoprefixer, esbuild, tailwindcss, tsx, @types/express, @types/node, typescript (+1 more)

### Community 44 - "Queue/Jobs Facade & main.go"
Cohesion: 0.47
Nodes (3): Jobs(), go_pkg_github_com_goravel_framework_contracts_queue, github.com/goravel/framework/contracts/queue.Job

### Community 45 - "NPM Scripts"
Cohesion: 0.33
Nodes (6): scripts, build, clean, dev, lint, preview

### Community 46 - "Vite Config"
Cohesion: 0.40
Nodes (4): ref_path, @tailwindcss/vite, ref_vite, ref_vitejs_plugin_react

### Community 47 - "Env Config Loading"
Cohesion: 0.50
Nodes (4): Config, go_pkg_github_com_joho_godotenv, getEnv(), LoadConfig()

### Community 48 - "Mail Facade"
Cohesion: 0.50
Nodes (3): Mail(), go_pkg_github_com_goravel_framework_contracts_mail, github.com/goravel/framework/contracts/mail.Mail

### Community 49 - "Validation Facade"
Cohesion: 0.50
Nodes (3): Validation(), go_pkg_github_com_goravel_framework_contracts_validation, github.com/goravel/framework/contracts/validation.Validation

### Community 50 - "Default Template Readmes & Logos"
Cohesion: 0.50
Nodes (4): frontend/README.md — Vite + React Template Readme, react.svg — Default React logo asset, vite.svg — Default Vite logo asset, frontend/view/README.md — AI Studio App Readme

## Knowledge Gaps
- **129 isolated node(s):** `LinkPreviewRequest`, `PostComment`, `name`, `private`, `version` (+124 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 324 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User & Network Repository/Service Layer` to `Auth & Account DTOs/Controllers`, `Admin Dashboard Render Helpers`, `Auth Service Helpers`, `Core Domain Models`, `Network Connections Feature`, `Post Repository & Feed Data`, `Auth DTOs, Roles & Middleware`, `Post Creation & Notification Helpers`, `OAuth Login Flow`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `Post` connect `Post Repository & Feed Data` to `Auth & Account DTOs/Controllers`, `Admin Dashboard Render Helpers`, `Auth Service Helpers`, `Post Service Business Logic`, `Core Domain Models`, `Post Creation & Notification Helpers`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `react-router-dom` connect `Auth/User API & Navigation Components` to `App Shell, Login/Signup & Admin Settings`, `Network/Post API Clients & Modals`, `Frontend Build Config & Dependencies`, `Frontend API Clients (Admin/Job/Message)`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `LinkPreviewRequest`, `PostComment`, `name` to the rest of the system?**
  _129 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth & Account DTOs/Controllers` be split into smaller, more focused modules?**
  _Cohesion score 0.12423790814252811 - nodes in this community are weakly interconnected._
- **Should `Admin Dashboard Render Helpers` be split into smaller, more focused modules?**
  _Cohesion score 0.11613103555348549 - nodes in this community are weakly interconnected._
- **Should `Auth Service Helpers` be split into smaller, more focused modules?**
  _Cohesion score 0.06273546273546274 - nodes in this community are weakly interconnected._