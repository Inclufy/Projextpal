"""
Universal schema-drift detector for ALL Django models.

Scans every model registered in INSTALLED_APPS and cross-references its
DB table against information_schema. For each table, lists every NOT-NULL
column that has NEITHER a server-side default NOR a corresponding model
field — these are the columns that crash INSERTs with NotNullViolation.

Run inside the backend container:

    docker exec -i projextpal-backend-prod python3 manage.py shell \
        -c "exec(open('scripts/scan_all_drift.py').read())"

Outputs:
  1. A console table of every drifted column
  2. A ready-to-paste SQL transaction with conservative defaults you can
     review and run to unblock production INSERTs.

Conservative default heuristic:
  - varchar/text  → '' (empty string)
  - bool          → false
  - int / numeric → 0
  - timestamp     → CURRENT_TIMESTAMP
  - date          → CURRENT_DATE
  - jsonb         → '{}'::jsonb

You should review the generated SQL before running. Some columns may
deserve a more meaningful default (e.g. currency='EUR', status='planning').
"""
from __future__ import annotations

from django.apps import apps
from django.db import connection

DEFAULT_FOR_TYPE = {
    "character varying": "''",
    "text": "''",
    "boolean": "false",
    "integer": "0",
    "bigint": "0",
    "smallint": "0",
    "numeric": "0",
    "real": "0",
    "double precision": "0",
    "timestamp with time zone": "CURRENT_TIMESTAMP",
    "timestamp without time zone": "CURRENT_TIMESTAMP",
    "date": "CURRENT_DATE",
    "jsonb": "'{}'::jsonb",
    "json": "'{}'::json",
}

# Columns we always skip — these are auto/required by Django framework
SKIP_COLUMNS = {
    "id",  # auto pk
    "created_at",  # usually auto_now_add
    "updated_at",  # usually auto_now
    "date_joined",  # auth user
    "last_login",  # auth user
    "password",  # auth, always set explicitly
    "username",  # always required input
    "email",  # always required input
    "name",  # usually required input
    "title",  # usually required input
}

# Columns we KNOW are required user input — skip even though they crash
REQUIRED_INPUT_COLUMNS = {
    "company_id",  # backend always sets via serializer.save(company=...)
    "user_id",  # auth scope
    "created_by_id",  # backend sets
}


def _table_columns_needing_default(table: str) -> list[tuple[str, str]]:
    sql = """
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = %s
          AND is_nullable = 'NO'
          AND column_default IS NULL
        ORDER BY ordinal_position
    """
    with connection.cursor() as cur:
        cur.execute(sql, [table])
        return list(cur.fetchall())


def _model_columns(table: str) -> set[str]:
    for model in apps.get_models():
        if model._meta.db_table == table:
            return {f.column for f in model._meta.fields}
    return set()


def _quote_default(data_type: str) -> str:
    return DEFAULT_FOR_TYPE.get(data_type, "''")


print("=" * 70)
print("ProjeXtPal universal schema-drift scan")
print("=" * 70)

# Collect every db_table currently in use
all_tables = sorted({m._meta.db_table for m in apps.get_models()})
print(f"Scanning {len(all_tables)} tables...\n")

total_drift = 0
sql_lines = ["BEGIN;"]
console_rows = []

for table in all_tables:
    bad_cols = _table_columns_needing_default(table)
    if not bad_cols:
        continue
    model_fields = _model_columns(table)

    drift_for_this_table = []
    for col, dtype in bad_cols:
        if col in SKIP_COLUMNS:
            continue
        if col in REQUIRED_INPUT_COLUMNS:
            continue
        # If the model HAS the field, Django sends a value (probably with
        # a Python-side default). The DB-NULL bug only happens when the
        # model lacks the field OR the model field allows null but DB doesn't.
        # For demo-safety we patch BOTH cases: it's harmless if Django
        # always sends a value (DB default is never used).
        drift_for_this_table.append((col, dtype))

    if not drift_for_this_table:
        continue

    total_drift += len(drift_for_this_table)
    print(f"⚠ {table}  ({len(drift_for_this_table)} drifted)")
    for col, dtype in drift_for_this_table:
        in_model = "✓" if col in model_fields else "✗"
        print(f"    {in_model} {col:32s} {dtype}")
        sql_lines.append(
            f"ALTER TABLE {table} ALTER COLUMN {col} SET DEFAULT {_quote_default(dtype)};"
        )
        console_rows.append((table, col, dtype, col in model_fields))

sql_lines.append("COMMIT;")

print()
print("=" * 70)
print(f"Total drifted columns: {total_drift}")
print("=" * 70)

if total_drift == 0:
    print("\nPASS — no schema drift requiring DB defaults.")
else:
    print("\nReview-and-run SQL (paste into psql to apply demo-safe defaults):\n")
    print("\n".join(sql_lines))
    print()
    print("=" * 70)
    print("This is conservative — uses '' / 0 / false / CURRENT_TIMESTAMP.")
    print("Review for fields where a more meaningful default is appropriate")
    print("(e.g. currency='EUR', status='planning', priority='medium').")
    print("Pre-existing rows are NOT touched — only future INSERTs see defaults.")
