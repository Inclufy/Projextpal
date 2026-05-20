# AWS Hosting Topology — ProjeXtPal × Yanmar Europe

**Version:** 1.0 — pre-contract draft
**Date:** 2026-05
**Region:** eu-central-1 (Frankfurt) — primary
**DR:** eu-west-1 (Ireland) — daily cross-region snapshots

---

## 1. Deployment options

We offer three deployment models. Yanmar selects one per contract.

### Option A — Inclufy-managed single-tenant (Recommended for fast start)

```
                 Cloudflare (DDoS, WAF, TLS)
                            │
                            ▼
        ┌───────── projextpal-yanmar.inclufy.com ───────┐
        │                                                │
        │   ALB ──► ECS Fargate (Django) × 2           │
        │              │                                 │
        │              ├──► RDS Postgres 15 (Multi-AZ)  │
        │              │     (KMS-encrypted, Yanmar CMK) │
        │              │                                 │
        │              ├──► ElastiCache Redis            │
        │              │                                 │
        │              └──► S3 (uploads, exports)        │
        │                    (SSE-KMS, Yanmar CMK)       │
        └────────────────────────────────────────────────┘
                            │
                  Anthropic API   ← BYO Yanmar key, optional
                  OpenAI API      ← BYO Yanmar key, optional
```

- **Account ownership**: Inclufy AWS account.
- **VPC**: dedicated VPC per customer (Yanmar gets its own).
- **Data**: isolated DB schema + S3 bucket per customer.
- **KMS**: option of Inclufy-managed CMK (default) or Yanmar-owned external CMK via cross-account grant.
- **Operations**: Inclufy SRE runs deployments, monitoring, patching.
- **SLAs**: 99.9% uptime, 24h breach notification, 4h critical incident response.

**When to choose A**: fastest go-live (4-6 weeks); Yanmar wants Inclufy operational responsibility.

### Option B — Yanmar-controlled AWS account (Highest sovereignty)

```
   Yanmar AWS Organization
        │
        ├── Account: yanmar-projextpal-prod  ←── Inclufy deploys via cross-account IAM role
        │     │
        │     └── VPC (Yanmar-controlled)
        │           ECS / RDS / S3 / KMS (all Yanmar-owned)
        │
        └── Account: yanmar-projextpal-stg
```

- **Account ownership**: Yanmar AWS account.
- **Deployments**: Inclufy assumes a scoped IAM role (read+write to specific ECS/RDS/S3 ARNs only). No data access from Inclufy account.
- **KMS**: Yanmar-managed. Inclufy cannot decrypt at-rest data without explicit cross-account grant.
- **Audit**: Yanmar CloudTrail logs all Inclufy actions.
- **Operations**: Inclufy SRE deploys via IAM-role; Yanmar controls the AWS console.

**When to choose B**: Yanmar legal/InfoSec wants full data sovereignty; willing to add ~3 weeks to onboarding.

### Option C — Inclufy SaaS multi-tenant (Not recommended for Yanmar)

Shared infrastructure with row-level isolation. Cheaper but Yanmar's data shares VPC + DB cluster with other customers. **Listed only for completeness — we do not recommend this for a Yanmar-grade engagement.**

---

## 2. Network security

| Layer | Control |
|---|---|
| Edge | Cloudflare WAF (OWASP rules) + DDoS L3-L7 + bot management |
| TLS | 1.3 only, HSTS preload, OCSP stapling |
| ALB / NLB | Security group: 443 inbound only, source = Cloudflare IPs |
| ECS task | Security group: HTTPS egress to AWS APIs + Anthropic/OpenAI; no public ingress |
| RDS | Security group: 5432 inbound from ECS task SG only; no public IP |
| S3 | Bucket policy: deny `s3:*` from any IP except VPC endpoint; block public access enabled |
| VPC endpoint | Gateway endpoint for S3 + interface endpoint for Secrets Manager + KMS — egress never leaves AWS network |

---

## 3. BYO LLM key plumbing

Where the LLM call originates depends on whether Yanmar uses their own key:

```
            ┌─ no BYO key ─► Inclufy-pool key (settings.ANTHROPIC_API_KEY)
            │                  → call goes from ECS task to api.anthropic.com
ECS task ───┤
            │                  → call goes from ECS task to api.anthropic.com
            └─ BYO key set ──► Yanmar key (CompanyAIKey.anthropic_api_key)
                                 → optionally via Yanmar's gateway (CompanyAIKey.anthropic_base_url)
```

- BYO keys are stored encrypted-at-rest (KMS-CMK on the RDS data volume).
- Per-call audit row records `(company_id, provider, used_byo_key: bool, timestamp)`.
- Yanmar can rotate keys via the admin or `/api/v1/companies/<id>/ai-key/` endpoint at any time without downtime.

---

## 4. IAM scoping (for Option B cross-account access)

Inclufy assumes a single role per environment:

```yaml
RoleName: inclufy-projextpal-deployer
TrustPolicy:
  Principal: arn:aws:iam::<inclufy-deploy-acct>:role/projextpal-cicd
  Conditions:
    StringEquals:
      sts:ExternalId: <agreed-with-yanmar>
PermissionsPolicy:
  - ecs:UpdateService, ecs:DescribeServices, ecs:RegisterTaskDefinition  → only on specific cluster ARN
  - ecr:GetAuthorizationToken, ecr:BatchGetImage  → only on specific repo ARN
  - rds:DescribeDBInstances  → describe only, no Modify
  - logs:CreateLogStream, logs:PutLogEvents  → only on specific log group
  - kms:Decrypt  → ONLY for the secret-config KMS key, NOT the data KMS key
  Denied: all rds:Modify*, s3:GetObject on data bucket, kms:Decrypt on data CMK
```

Inclufy can deploy code but **cannot read project data**.

---

## 5. Backup & DR

| Item | Frequency | Retention | Restore RPO |
|---|---|---|---|
| RDS automated backup | Continuous (PITR) | 30 days | 5 min |
| RDS daily snapshot | Daily 02:00 UTC | 90 days | 24h |
| Cross-region snapshot copy | Daily | 90 days | 24h |
| S3 versioning + replication | Real-time | Lifecycle (90 days) | minutes |
| Application config | On every deploy | Last 25 | minutes |
| DR drill | Quarterly | Report retained 2 years | — |

RTO target: **4 hours** for catastrophic region loss; **15 min** for AZ loss.

---

## 6. Monitoring + alerting

- **CloudWatch**: metrics on ECS task health, RDS CPU/connections, ALB 5xx rates.
- **Sentry**: application-level errors, performance traces.
- **UptimeRobot**: external `/health/` probe every 5 minutes from 3 geos.
- **PagerDuty**: severity-1 paged 24/7 (Inclufy on-call rotation).
- **Yanmar dashboard**: optional read-only CloudWatch dashboard shared via cross-account.

---

## 7. Decision sheet for Yanmar

| Question | Choose A if… | Choose B if… |
|---|---|---|
| Speed to production | 4-6 weeks acceptable | Up to 10 weeks acceptable |
| Who runs the AWS account? | Inclufy | Yanmar |
| Who holds the KMS-CMK for data at rest? | Inclufy (default) — or Yanmar via cross-account grant | Yanmar |
| Where is the BYO LLM key stored? | In Inclufy-controlled RDS (KMS-encrypted) | In Yanmar-controlled RDS (Yanmar KMS) |
| Cost (~indicative) | ~€2.4k/mo all-in (single-tenant infra) | ~€3.2k/mo + AWS bill goes to Yanmar |
| Audit trail of Inclufy ops actions | Inclufy CloudTrail | Yanmar CloudTrail (full visibility) |

**Inclufy's recommendation**: **Option A with Yanmar-owned KMS-CMK for data at rest**. Best balance of speed + sovereignty — Yanmar holds the encryption key, Inclufy operates the platform.

---

*Open questions for Dhruv / Shah:*
1. Which option (A / A-with-CMK / B)?
2. Does Yanmar have an existing AWS Organization we should attach to?
3. Yanmar OpenAI/Anthropic account confirmed available, or do we proceed with Inclufy pool initially?
4. Any data residency constraint beyond EU (e.g. must stay in Germany specifically)?
