# Graph Report - medsos  (2026-11-11)

## Corpus Check
- 286 files · ~365,057 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 7, .css 2, .exe 2)

## Summary
- 1862 nodes · 6334 edges · 106 communities (84 shown, 22 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 226 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e571ecef`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- post_service.go
- dom.go
- github.com/goravel/framework/contracts/http.Context
- package.json
- validate-coverage-ledger.cjs
- PostCard.tsx
- testing.T
- react
- time.Time
- User
- Post
- AdminDashboardPage.jsx
- providers.go
- Messages.tsx
- jwt/jwt.go
- Api
- useLanguage
- validate-findings.test.cjs
- AuthService
- Lang
- Message
- .UpdatePost
- .Callback
- doc/PRODUCTION_CHECKLIST.md — Production Readiness Checklist
- authenticatedUserID
- Portfolio
- JobRepository
- Native, managed, and packaged artifacts
- CreatePostModal.tsx
- AppLayout.tsx
- AppModern.tsx
- AccountController
- PostComment
- data.ts
- compress.go
- SocialController
- Claims
- Proposal Investasi & Pengajuan Kemitraan Platform Media Sosial, Komunitas & UMKM Terpadu
- confirmed
- blockedBetween
- ATTACK-CLASSES.md
- MediaItem
- Security Audit
- os
- App.jsx
- PostController
- validate-findings.cjs
- ExampleTestSuite
- gorm.io/gorm.DB
- postRepo
- frontend/README.md — Vite + React Template Readme
- social_read.js
- artisan script
- icons.svg — Social/nav icon sprite (Bluesky, Discord, GitHub, X, Documentation, Social)
- goravel
- REA analysis optimization
- REA CI and tests audit
- preflightJsonText
- HTTP-Protocol and Authentication Hunting
- time.Duration
- AI, LLM, and Agent Hunting
- Client-Side and Browser Hunting
- Cloud and Deployment Hunting
- Data Isolation and Lifecycle Hunting
- Desktop, Mobile, and Local IPC Hunting
- Memory Safety, Binary, and Kernel Hunting
- Protocols, RPC, and Messaging Hunting
- Resource Exhaustion and Availability Hunting
- UserService
- reverse-engineer-anything/SKILL.md
- Connection and task recovery
- Vulnerability Hunting
- Supply Chain and Release Hunting
- Ponytail Help
- SendVerificationCode
- REA
- JavaScript and Electron application artifacts
- Runtime observation
- ponytail-audit/SKILL.md
- Ponytail Gain
- ponytail-review/SKILL.md
- Ponytail
- Agent environments from a live application
- Ponytail, lazy senior dev mode
- ponytail-debt/SKILL.md
- Phase 6: Produce target-neutral reports from final records
- uploadedFile
- rea-tool-design/SKILL.md
- Packages and extraction
- Managed PE/CLI
- frontend_view_src_index
- go_pkg_github_com_golang_migrate_migrate_v4
- go_pkg_github_com_golang_migrate_migrate_v4_database_mysql
- go_pkg_github_com_golang_migrate_migrate_v4_source_file
- go_pkg_html
- go_pkg_sort
- lucide-react
- .Upload
- InspectFile
- chatPeer
- rate_limit_middleware_test.go

## God Nodes (most connected - your core abstractions)
1. `Attr` - 78 edges
2. `useLanguage()` - 65 edges
3. `User` - 61 edges
4. `Element` - 59 edges
5. `react` - 56 edges
6. `authenticatedUserID()` - 54 edges
7. `RenderBeranda()` - 51 edges
8. `useAuth()` - 49 edges
9. `RenderProfile()` - 47 edges
10. `RenderDashboardAdminPengaturanSistem()` - 45 edges

## Surprising Connections (you probably didn't know these)
- `Write for users and retain credit` --references--> `User`  [INFERRED]
  .agents/skills/rea-changelog-update/SKILL.md → frontend/src/components/types.ts
- `Reusing application Evidence` --references--> `source()`  [INFERRED]
  .agents/skills/reverse-engineer-anything/references/javascript-applications.md → .agents/skills/security-audit/validate-findings.test.cjs
- `Validation rules (apply before reporting ANY finding here)` --references--> `confirmed()`  [INFERRED]
  .agents/skills/security-audit/AI-AND-LLM.md → .agents/skills/security-audit/validate-findings.test.cjs
- `Attack classes — choose and split based on Phase 1` --references--> `confirmed()`  [INFERRED]
  .agents/skills/security-audit/ATTACK-CLASSES.md → .agents/skills/security-audit/validate-findings.test.cjs
- `Validation rules (apply before reporting ANY finding here)` --references--> `confirmed()`  [INFERRED]
  .agents/skills/security-audit/CLIENT-SIDE.md → .agents/skills/security-audit/validate-findings.test.cjs

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Connect Modern documentation suite (index + setup + requirements + providers + checklist)** — doc_readme_doc, local_setup_doc, doc_requirements_status_doc, doc_external_providers_doc, doc_production_checklist_doc [EXTRACTED 0.95]
- **Connect Modern purple cube brand visual identity** — frontend_public_favicon_svg, frontend_src_assets_hero_png, frontend_index_doc [INFERRED 0.75]

## Communities (106 total, 22 thin omitted)

### Community 0 - "post_service.go"
Cohesion: 0.13
Nodes (55): flexBool, messageIntentPayload, LinkPreviewRequest, go_pkg_bytes, go_pkg_context, go_pkg_crypto_aes, go_pkg_crypto_cipher, go_pkg_crypto_rand (+47 more)

### Community 1 - "dom.go"
Cohesion: 0.11
Nodes (109): DashboardStats, LoginData, RegisterData, Attr, GroupNode, Raw, Text, io.Writer (+101 more)

### Community 2 - "github.com/goravel/framework/contracts/http.Context"
Cohesion: 0.12
Nodes (19): authCookie(), clearAuthCookies(), setAuthCookies(), HealthLive(), HealthReady(), SessionActivity(), SessionInfo(), SocialController (+11 more)

### Community 3 - "package.json"
Cohesion: 0.05
Nodes (43): dependencies, axios, lucide-react, motion, react, react-dom, react-router-dom, devDependencies (+35 more)

### Community 4 - "validate-coverage-ledger.cjs"
Cohesion: 0.12
Nodes (42): ATTEMPT_FIELDS, ATTEMPT_STATUSES, canonicalCoverageId(), collectUnitErrors(), createErrorList(), encodeCanonicalRef(), escapeUnsafeDiagnosticCharacters(), fs (+34 more)

### Community 5 - "PostCard.tsx"
Cohesion: 0.09
Nodes (36): postApi, AddPortfolioModal(), AddPortfolioModalProps, CommentThread(), CommentThreadProps, errorText(), APP_ONLY, EmbedModal() (+28 more)

### Community 6 - "testing.T"
Cohesion: 0.16
Nodes (19): TestFetchLinkPreviewRetriesAreBounded(), TestFetchLinkPreviewUpdatesQueuedLink(), TestPostHashCreation(), TestUserBeforeCreateGeneratesUsername(), NewMessageRepository(), messageTestDB(), TestDeleteChatHistoryIsPrivateAndNewMessagesDoNotRestoreOldHistory(), TestMutedChatSuppressesNotificationsAndReadingClearsUnread() (+11 more)

### Community 7 - "react"
Cohesion: 0.09
Nodes (33): authApi, userApi, IdleSession(), useAppNavigate(), ProfileHeader(), AuthContext, useAuth(), HomePage() (+25 more)

### Community 8 - "time.Time"
Cohesion: 0.08
Nodes (23): User, Post, User, User, adminReportResponse, time.Time, ConversationReport, FailedQueueRecord (+15 more)

### Community 9 - "User"
Cohesion: 0.08
Nodes (10): NewNetworkController(), User, PostComment, NetworkRepository, NewNetworkRepository(), UserRepository, callSession, callSignalEvent (+2 more)

### Community 10 - "Post"
Cohesion: 0.12
Nodes (8): Post, PostComment, User, PostRepository, PostService, BerandaData, ProfileData, PostHashtag

### Community 11 - "AdminDashboardPage.jsx"
Cohesion: 0.24
Nodes (7): adminApi, AdminModerationTab(), AdminOverviewTab(), AdminUsersTab(), useNotifications(), AdminDashboardPage(), AdminDashboardPage

### Community 12 - "providers.go"
Cohesion: 0.08
Nodes (23): Providers(), go_pkg_github_com_goravel_framework_auth, go_pkg_github_com_goravel_framework_cache, go_pkg_github_com_goravel_framework_crypt, go_pkg_github_com_goravel_framework_database, go_pkg_github_com_goravel_framework_event, go_pkg_github_com_goravel_framework_filesystem, go_pkg_github_com_goravel_framework_grpc (+15 more)

### Community 13 - "Messages.tsx"
Cohesion: 0.09
Nodes (28): api, goToLogin(), onPublicPage(), PUBLIC_PATHS, readCookie(), refreshSession(), jobApi, messageApi (+20 more)

### Community 14 - "jwt/jwt.go"
Cohesion: 0.05
Nodes (109): App(), Artisan(), Auth(), Cache(), Config(), Crypt(), DB(), Event() (+101 more)

### Community 15 - "Api"
Cohesion: 0.13
Nodes (23): GetLocalStorageService(), NewAccountController(), NewAuthController(), NewPostController(), NewSocialController(), NewUserController(), AdminMiddleware(), AuthMiddleware() (+15 more)

### Community 16 - "useLanguage"
Cohesion: 0.08
Nodes (29): LanguageSwitch(), Toast(), AuthLayout(), AuthLayoutProps, Feature, AuthShowcase(), Feed(), FeedProps (+21 more)

### Community 17 - "validate-findings.test.cjs"
Cohesion: 0.06
Nodes (34): agents_skills_security_audit_report_schema, LIMITS, archivedAttempt(), assert, fs, {
  LIMITS,
  canonicalCoverageId,
  encodeCanonicalRef,
  isSafeAgentId,
  isSafeRelativePath,
  preflightJsonText,
  validateDocument,
}, localCheck(), os (+26 more)

### Community 18 - "AuthService"
Cohesion: 0.16
Nodes (14): AuthResponse, LoginRequest, RefreshRequest, RegisterRequest, AuthService, issueTokens(), normalizeUsername(), generate() (+6 more)

### Community 19 - "Lang"
Cohesion: 0.12
Nodes (13): Lang(), context.Context, github.com/goravel/framework/contracts/translation.Translator, net.Conn, net.IP, FetchLinkPreview, FallbackPreview(), FetchPreview() (+5 more)

### Community 20 - "Message"
Cohesion: 0.14
Nodes (8): NewMessageController(), Conversation, User, Message, User, MessageRepository, Conversation, MessageRepositoryImpl

### Community 21 - ".UpdatePost"
Cohesion: 0.13
Nodes (21): Queue(), PostLink, PostMedia, blockedEitherWay(), buildMedia(), checkSubscriptionQuota(), createMentionNotifications(), dispatchLinkPreview() (+13 more)

### Community 22 - ".Callback"
Cohesion: 0.14
Nodes (19): frontendURL(), identityFromJWT(), NewOAuthController(), normalizeOAuthUsername(), oauthErrorRedirect(), oauthRedirect(), parseAppleUserJSON(), parseOAuthPicture() (+11 more)

### Community 23 - "doc/PRODUCTION_CHECKLIST.md — Production Readiness Checklist"
Cohesion: 0.16
Nodes (15): Connect Modern (product/app name), Goravel Framework, start-local.ps1 (local backend/frontend bootstrap script), stop-local.ps1 (stops background local server), doc/EXTERNAL_PROVIDERS.md — External Provider Configuration, doc/PRODUCTION_CHECKLIST.md — Production Readiness Checklist, doc/README.md — Connect Modern Documentation Index, doc/REQUIREMENTS_STATUS.md — Functional Requirements Status (+7 more)

### Community 24 - "authenticatedUserID"
Cohesion: 0.13
Nodes (7): dbTransactionResponse(), routeID(), authenticatedUserID(), followUser(), notifyFollow(), publicUsers(), NetworkController

### Community 25 - "Portfolio"
Cohesion: 0.21
Nodes (7): NewPortfolioController(), Portfolio, User, PortfolioRepository, NewPortfolioRepository(), PortfolioService, NewPortfolioService()

### Community 26 - "JobRepository"
Cohesion: 0.14
Nodes (9): NewJobController(), User, JobPosting, User, JobRepository, NewJobRepository(), JobController, JobApplication (+1 more)

### Community 27 - "Native, managed, and packaged artifacts"
Cohesion: 0.07
Nodes (30): Apple app resources, Apple IPS crash reports, Bridge request ceiling, CPython pyc files, Desktop installation directories, DOS MZ with Ghidra, ELF note tables, Erlang BEAM files (+22 more)

### Community 28 - "CreatePostModal.tsx"
Cohesion: 0.16
Nodes (23): CATEGORIES, CreatePostModal(), CreatePostModalProps, CURRENCIES, errorText(), formatDuration(), FULFILLMENT, MediaItem (+15 more)

### Community 29 - "AppLayout.tsx"
Cohesion: 0.21
Nodes (16): Navbar(), Sidebar(), AppLayout(), AppLayoutProps, ROUTES, emptyResults, Header(), OriginalPost() (+8 more)

### Community 30 - "AppModern.tsx"
Cohesion: 0.15
Nodes (11): ref_components_feed, ref_components_header, ref_components_jobs, ref_components_login, ref_components_messages, ref_components_network, ref_components_profile, ref_components_rightsidebar (+3 more)

### Community 31 - "AccountController"
Cohesion: 0.14
Nodes (13): findUserByTarget(), issueCode(), nullableString(), randomCode(), setPasswordAndRevoke(), validPassword(), valueOf(), verifyCode() (+5 more)

### Community 32 - "PostComment"
Cohesion: 0.50
Nodes (3): PostComment, Post, User

### Community 33 - "data.ts"
Cohesion: 0.13
Nodes (15): Finalize with Release Please, Inventory before prose, REA changelog update, Write for users and retain credit, initialPosts, mockJobs, mockUsers, HeaderProps (+7 more)

### Community 34 - "compress.go"
Cohesion: 0.21
Nodes (15): go_pkg_encoding_binary, go_pkg_image, go_pkg_image_color, go_pkg_image_draw, go_pkg_image_jpeg, go_pkg_image_png, image.Image, applyOrientation() (+7 more)

### Community 35 - "SocialController"
Cohesion: 0.17
Nodes (14): appBaseURL(), formatPrice(), loadPublicPost(), publicPostURL(), routePostID(), shareLinks(), acceptedFollowingBatch(), blockedBetweenBatch() (+6 more)

### Community 36 - "Claims"
Cohesion: 0.13
Nodes (20): RoleMiddleware(), LoginSession, UserRole, jwt.RegisteredClaims, Claims, parse(), ValidateAccessToken(), ValidateRefreshToken() (+12 more)

### Community 37 - "Proposal Investasi & Pengajuan Kemitraan Platform Media Sosial, Komunitas & UMKM Terpadu"
Cohesion: 0.11
Nodes (17): 1. Ringkasan Eksekutif & Tesis Investasi (Investment Thesis), 2. Analisis Potensi Pasar Indonesia (Market Sizing: TAM, SAM, SOM), 3. Keunggulan Kompetitif (Competitive Moat vs. Medsos Konvensional), 4.1 Lapisan 1: Langganan Pengguna, Kreator & UMKM (In-App Subscription), 4.2 Lapisan 2: Paket Kerja Sama & Pengadaan Instansi (B2B / B2G), 4. Rincian Skema Harga & Monetisasi (Pricing Structure), 5.1 Simulasi Proyeksi Pendapatan Tahunan (12 Bulan Pertama), 5.2 Kebutuhan Modal, Alokasi Dana (Use of Funds) & Opsi Skema Bagi Hasil Investor (+9 more)

### Community 38 - "confirmed"
Cohesion: 0.24
Nodes (16): Structured hunter result, Cost budget, Coverage and prior runs, Full audit planning, Run profiles and scope, confirmed(), evidence(), needsValidation() (+8 more)

### Community 39 - "blockedBetween"
Cohesion: 0.18
Nodes (9): cleanupStaleCallsLocked(), formatCallDurationText(), MessageController, messageIntentKey(), queueCallEventLocked(), resolvePostToken(), resolveUserToken(), touchUserPresence() (+1 more)

### Community 40 - "ATTACK-CLASSES.md"
Cohesion: 0.14
Nodes (7): Attack Classes, Attack classes — choose and split based on Phase 1, Architecture summary and companion selection, Deterministic coverage ledger, Phase 1: Map the source and plan coverage, Prior-run input, Reconnaissance

### Community 41 - "MediaItem"
Cohesion: 0.18
Nodes (11): CreatePostRequest, MediaItem, ShopPostRequest, UpdatePostRequest, ShopProduct, buildShop(), CountWords(), normalizeFulfillment() (+3 more)

### Community 42 - "Security Audit"
Cohesion: 0.14
Nodes (14): Anti-patterns, Core principles, Full audit setup, Full audit workflow, Operating modes, Platform terminology, Recommend the smallest effective source fix, Require a boundary and result (+6 more)

### Community 44 - "App.jsx"
Cohesion: 0.19
Nodes (9): App(), AuthProvider(), applyTheme(), initialTheme, ThemeContext, ThemeProvider(), frontend_src_index, AppRouter() (+1 more)

### Community 45 - "PostController"
Cohesion: 0.21
Nodes (5): compactStrings(), splitListInput(), PostType, MediaType, PostController

### Community 46 - "validate-findings.cjs"
Cohesion: 0.11
Nodes (40): canonicalKey(), append(), encode(), codePointLength(), collect(), collectDataLimitErrors(), collectFindingSemanticErrors(), collectSchemaErrors() (+32 more)

### Community 47 - "ExampleTestSuite"
Cohesion: 0.20
Nodes (6): ExampleTestSuite, go_pkg_github_com_stretchr_testify_suite, github.com/goravel/framework/testing.TestCase, github.com/stretchr/testify/suite.Suite, TestExampleTestSuite(), TestCase

### Community 48 - "gorm.io/gorm.DB"
Cohesion: 0.24
Nodes (6): NewPostHash(), GenerateUsername(), gorm.io/gorm.DB, configEnv(), envInt(), InitDB()

### Community 49 - "postRepo"
Cohesion: 0.31
Nodes (4): postPreloads(), sanitizePostUsers(), withCounters(), postRepo

### Community 50 - "frontend/README.md — Vite + React Template Readme"
Cohesion: 0.67
Nodes (3): frontend/README.md — Vite + React Template Readme, react.svg — Default React logo asset, vite.svg — Default Vite logo asset

### Community 60 - "REA analysis optimization"
Cohesion: 0.17
Nodes (10): Applying the reasoning elsewhere, Exact-address lookup: a measured, narrow improvement, Kuna: reuse before adding machinery, Other transferable changes and their limits, Recorded workload and results, Compare completed tasks and limit the claim, Keep one interpretation and a defined reuse lifetime, Locate the earliest unnecessary work (+2 more)

### Community 61 - "REA CI and tests audit"
Cohesion: 0.18
Nodes (9): Equivalent completed work, Measurement and CI checks, Runner waits and console noise, Workflow, caches, and shared artifacts, Assess efficiency without losing the gate, Establish the executed baseline, Fix, verify, and hand off within scope, Prove the failure or protection (+1 more)

### Community 62 - "preflightJsonText"
Cohesion: 0.40
Nodes (11): JsonStructureError, preflightJsonText(), beginContainer(), beginString(), beginValue(), closeContainer(), countValue(), currentContainer() (+3 more)

### Community 63 - "HTTP-Protocol and Authentication Hunting"
Cohesion: 0.18
Nodes (10): API-key and mTLS attack classes (subagent_type: `general`), Browser-session attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Federated-identity attack classes (subagent_type: `general`), HTTP framing and cache attack classes (subagent_type: `general`), HTTP-Protocol and Authentication Hunting, MFA, passkey, and account-transition attack classes (subagent_type: `general`), Universal moves (apply across the above) (+2 more)

### Community 64 - "time.Duration"
Cohesion: 0.20
Nodes (7): RateLimit(), sync.Mutex, time.Duration, TranscodePostMedia, fixedWindowLimiter, rateWindow, Executable()

### Community 65 - "AI, LLM, and Agent Hunting"
Cohesion: 0.20
Nodes (9): AI, LLM, and Agent Hunting, Context, retrieval, and memory attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), MCP and sub-agent trust classes (subagent_type: `general`), Output and disclosure attack classes (subagent_type: `general`), Tool and action attack classes (subagent_type: `general`), Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+1 more)

### Community 66 - "Client-Side and Browser Hunting"
Cohesion: 0.20
Nodes (10): Client-Side and Browser Hunting, Core discipline (include in every agent prompt for this domain), Cross-origin messaging and network attack classes (subagent_type: `general`), Cross-site information leak classes (subagent_type: `general`), DOM and object-state attack classes (subagent_type: `general`), Service-worker and browser-storage attack classes (subagent_type: `general`), UI-redress and navigation attack classes (subagent_type: `general`), Universal moves (apply across the above) (+2 more)

### Community 67 - "Cloud and Deployment Hunting"
Cohesion: 0.20
Nodes (10): Cloud and Deployment Hunting, Configuration and secret lifecycle attack classes (subagent_type: `general`), Container and orchestration attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Ingress, network, and control-plane attack classes (subagent_type: `general`), Managed storage, events, and edge attack classes (subagent_type: `general`), Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+2 more)

### Community 68 - "Data Isolation and Lifecycle Hunting"
Cohesion: 0.20
Nodes (9): Core discipline (include in every agent prompt for this domain), Data Isolation and Lifecycle Hunting, Deletion, revocation, and lifecycle attack classes (subagent_type: `general`), Derived-data and disclosure attack classes (subagent_type: `general`), Export, backup, restore, and migration attack classes (subagent_type: `general`), Tenant and object-isolation attack classes (subagent_type: `general`), Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+1 more)

### Community 69 - "Desktop, Mobile, and Local IPC Hunting"
Cohesion: 0.20
Nodes (10): Application-state and device-lifecycle attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Deep-link, callback, and navigation attack classes (subagent_type: `general`), Desktop, Mobile, and Local IPC Hunting, Local IPC and exported-component attack classes (subagent_type: `general`), Privileged-helper and local-file attack classes (subagent_type: `general`), Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+2 more)

### Community 70 - "Memory Safety, Binary, and Kernel Hunting"
Cohesion: 0.20
Nodes (10): Binary loading and runtime attack classes (subagent_type: `general`), Bounds, integer, and representation attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), FFI and ABI attack classes (subagent_type: `general`), Kernel and privileged-interface attack classes (subagent_type: `general`), Lifetime, type, and concurrency attack classes (subagent_type: `general`), Memory Safety, Binary, and Kernel Hunting, Universal moves (apply across the above) (+2 more)

### Community 71 - "Protocols, RPC, and Messaging Hunting"
Cohesion: 0.20
Nodes (9): Broker and queue isolation attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Framing, schema, and interpretation attack classes (subagent_type: `general`), Protocols, RPC, and Messaging Hunting, Replay, ordering, and transaction attack classes (subagent_type: `general`), RPC identity and authorization attack classes (subagent_type: `general`), Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+1 more)

### Community 72 - "Resource Exhaustion and Availability Hunting"
Cohesion: 0.20
Nodes (9): Computational amplification attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Failure and recovery attack classes (subagent_type: `general`), Quota and scheduling attack classes (subagent_type: `general`), Resource accumulation attack classes (subagent_type: `general`), Resource Exhaustion and Availability Hunting, Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here) (+1 more)

### Community 73 - "UserService"
Cohesion: 0.24
Nodes (6): CreatePortfolioRequest, valueOrEmpty(), UserService, trimmedOrNil(), ValidateOwnImage(), ValidateWebsite()

### Community 75 - "Connection and task recovery"
Cohesion: 0.22
Nodes (9): Choose the remedy from the observed failure, Codex tool approval is separate from REA readiness, Connection and task recovery, Continue through an installed CLI, Distinguish client and server deadlines, REA installed as a client plugin, Recovery ladder, Repair an editable REA limit (+1 more)

### Community 76 - "Vulnerability Hunting"
Cohesion: 0.22
Nodes (9): Core hunting method — include in every hunter prompt, Core validation rules — include in every hunter prompt, Coverage-critic waves, Local validation boundaries, Parent consolidation and ledger update, Phase 2: Run coverage-led hunting waves, Promotion procedure — copy this promotion procedure verbatim into every hunter prompt, Required hunter prompt (+1 more)

### Community 77 - "Supply Chain and Release Hunting"
Cohesion: 0.22
Nodes (8): CI and automation attack classes (subagent_type: `general`), Core discipline (include in every agent prompt for this domain), Dependency and build-input attack classes (subagent_type: `general`), Release and update attack classes (subagent_type: `general`), Supply Chain and Release Hunting, Universal moves (apply across the above), Validation rules (apply before reporting ANY finding here), When to use this file

### Community 78 - "Ponytail Help"
Cohesion: 0.25
Nodes (7): Configure Default Mode, Deactivate, Levels, More, Ponytail Help, Skills, Update

### Community 79 - "SendVerificationCode"
Cohesion: 0.29
Nodes (5): SendVerificationCode, configOrEnv(), sendEmail(), SendVerification(), sendWebhook()

### Community 80 - "REA"
Cohesion: 0.29
Nodes (7): Connect only when needed, Finish the task, Plan broader investigations, REA, Read only the relevant guide, Route the target first, Work summary-first

### Community 81 - "JavaScript and Electron application artifacts"
Cohesion: 0.33
Nodes (6): Inventory route candidates without returning the application graph, JavaScript and Electron application artifacts, Read a module without repeating analysis, Recover an oversized display, Reusing application Evidence, Trace only the remaining question

### Community 82 - "Runtime observation"
Cohesion: 0.33
Nodes (5): Browser and Electron, Fiddler Everywhere traffic debugging, Native runtime questions, Runtime observation, Who performs the action

### Community 83 - "ponytail-audit/SKILL.md"
Cohesion: 0.40
Nodes (4): 1. Map first, 2. Look for, 3. Check before you report, 4. Output

### Community 84 - "Ponytail Gain"
Cohesion: 0.40
Nodes (4): Boundaries, Honesty boundary, Ponytail Gain, Scoreboard

### Community 85 - "ponytail-review/SKILL.md"
Cohesion: 0.40
Nodes (4): 1. Understand first, 2. Look for, 3. Check before you report, 4. Output

### Community 86 - "Ponytail"
Cohesion: 0.40
Nodes (4): Before you write, Levels, Ponytail, The smallest complete change

### Community 87 - "Agent environments from a live application"
Cohesion: 0.40
Nodes (5): Agent environments from a live application, Before recording, Check coverage, Export and hand off, Record a session an environment can learn writes from

### Community 88 - "Ponytail, lazy senior dev mode"
Cohesion: 0.50
Nodes (3): Before you write, Ponytail, lazy senior dev mode, The smallest complete change

### Community 89 - "ponytail-debt/SKILL.md"
Cohesion: 0.50
Nodes (3): Boundaries, Output, Scan

### Community 90 - "Phase 6: Produce target-neutral reports from final records"
Cohesion: 0.50
Nodes (4): `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md`, Phase 6: Produce target-neutral reports from final records, `REPORT.md`

### Community 101 - "lucide-react"
Cohesion: 0.36
Nodes (4): LinkPreviewCard(), PostCard(), PostForm(), lucide-react

### Community 102 - ".Upload"
Cohesion: 0.31
Nodes (3): github.com/goravel/framework/contracts/filesystem.File, StoredMedia, LocalStorageService

### Community 103 - "InspectFile"
Cohesion: 0.28
Nodes (9): detectMedia(), envMegabytes(), InspectFile(), maxImageSize(), maxVideoSize(), TestInspectRejectsOversizedFile(), TestDetectMediaContainers(), TestVideoLongerThanThirtyMinutesRejected() (+1 more)

### Community 105 - "rate_limit_middleware_test.go"
Cohesion: 0.40
Nodes (4): TestFixedWindowLimiterIsSafeUnderConcurrentLoad(), TestFixedWindowLimiterRejectsAndResets(), go_pkg_github_com_stretchr_testify_assert, go_pkg_sync_atomic

## Knowledge Gaps
- **344 isolated node(s):** `fs`, `path`, `{ TextDecoder }`, `REQUIRED_FIELDS`, `REF_FIELDS` (+339 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 572 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `confirmed()` connect `confirmed` to `AI, LLM, and Agent Hunting`, `Client-Side and Browser Hunting`, `Cloud and Deployment Hunting`, `Data Isolation and Lifecycle Hunting`, `Desktop, Mobile, and Local IPC Hunting`, `Memory Safety, Binary, and Kernel Hunting`, `Protocols, RPC, and Messaging Hunting`, `ATTACK-CLASSES.md`, `Resource Exhaustion and Availability Hunting`, `Security Audit`, `Vulnerability Hunting`, `Supply Chain and Release Hunting`, `validate-findings.test.cjs`, `HTTP-Protocol and Authentication Hunting`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `User` connect `User` to `post_service.go`, `dom.go`, `github.com/goravel/framework/contracts/http.Context`, `Claims`, `time.Time`, `UserService`, `Post`, `gorm.io/gorm.DB`, `AuthService`, `.UpdatePost`, `.Callback`, `authenticatedUserID`, `AccountController`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `JavaScript and Electron application artifacts` connect `JavaScript and Electron application artifacts` to `reverse-engineer-anything/SKILL.md`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `fs`, `path`, `{ TextDecoder }` to the rest of the system?**
  _344 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `post_service.go` be split into smaller, more focused modules?**
  _Cohesion score 0.12995337995337997 - nodes in this community are weakly interconnected._
- **Should `dom.go` be split into smaller, more focused modules?**
  _Cohesion score 0.11441647597254005 - nodes in this community are weakly interconnected._
- **Should `github.com/goravel/framework/contracts/http.Context` be split into smaller, more focused modules?**
  _Cohesion score 0.11748381128584644 - nodes in this community are weakly interconnected._