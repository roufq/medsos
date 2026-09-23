# Checklist Production

## Infrastruktur

- [ ] Domain dan DNS.
- [ ] HTTPS certificate.
- [ ] VPS/cloud server.
- [ ] Nginx atau load balancer.
- [ ] MySQL managed dan backup otomatis.
- [ ] Redis dan queue worker.
- [ ] Object storage dan CDN.
- [ ] Staging environment.
- [ ] CI/CD dan rollback.

## Keamanan

- [ ] Semua secret dipindah ke secret manager.
- [ ] `APP_DEBUG=false`.
- [ ] JWT secret dan APP_KEY baru untuk production.
- [ ] CORS dibatasi ke domain resmi.
- [ ] Rate limit reverse proxy.
- [ ] WAF dan virus scanning media.
- [ ] Audit log admin.
- [ ] Privacy policy dan terms of service.

## Observability

- [ ] Error tracking seperti Sentry.
- [ ] Metrics Prometheus/Grafana.
- [ ] Centralized logging.
- [ ] Uptime monitoring.
- [ ] Alert untuk error, latency, queue, storage, dan database.

## Performance test

- [ ] Feed 50 post per request di bawah 2 detik.
- [ ] Login concurrent test.
- [ ] Upload dan transcoding test.
- [ ] Like/comment burst test.
- [ ] Queue throughput test.
- [ ] Database index review.
- [ ] Target DAU dan capacity plan.
- [ ] Backup restore test.
- [ ] Failover dan disaster recovery drill.

## Perintah lokal

```powershell
powershell -ExecutionPolicy Bypass -File .\start-local.ps1
powershell -ExecutionPolicy Bypass -File .\stop-local.ps1
```
