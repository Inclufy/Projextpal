# PRINCE2 Backend Installation Guide

## Quick Installation

### 1. Copy the prince2 folder to your backend
```bash
cp -r prince2 /path/to/backend/
```

### 2. Add to INSTALLED_APPS in settings.py
```python
INSTALLED_APPS = [
    # ... existing apps
    'sixsigma',  # Already exists
    'prince2',   # ADD THIS LINE
]
```

### 3. Add URLs to core/urls.py
Find the sixsigma include and add prince2 below it:
```python
urlpatterns = [
    # ... existing patterns
    path('api/v1/', include('sixsigma.urls')),   # Already exists
    path('api/v1/', include('prince2.urls')),    # ADD THIS LINE
]
```

### 4. Run migrations
```bash
cd backend
python manage.py makemigrations prince2
python manage.py migrate
```

### 5. Restart the server
```bash
python manage.py runserver
```

## Verify Installation

Test the API with:
```bash
# Replace TOKEN with your actual token
curl -H "Authorization: Bearer TOKEN" \
     http://localhost:8001/api/v1/projects/8/prince2/brief/
```

Should return `[]` (empty array) if successful.

## Frontend Setup

1. Replace `/src/lib/prince2Api.ts` with the fixed version that uses the `api` client
2. The API client must import from `./api` to get authentication headers

## File Structure
```
backend/
├── prince2/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
```

## API Endpoints

All endpoints follow the pattern: `/api/v1/projects/{project_id}/prince2/...`

| Endpoint | Methods |
|----------|---------|
| `/brief/` | GET, POST |
| `/brief/{id}/` | GET, PUT, PATCH, DELETE |
| `/brief/{id}/approve/` | POST |
| `/business-case/` | GET, POST |
| `/business-case/{id}/approve/` | POST |
| `/business-case/{id}/add_benefit/` | POST |
| `/business-case/{id}/add_risk/` | POST |
| `/pid/` | GET, POST |
| `/pid/{id}/baseline/` | POST |
| `/stages/` | GET, POST |
| `/stages/initialize_stages/` | POST |
| `/stages/{id}/start/` | POST |
| `/stages/{id}/complete/` | POST |
| `/stage-plans/` | GET, POST |
| `/stage-gates/` | GET, POST |
| `/stage-gates/{id}/approve/` | POST |
| `/work-packages/` | GET, POST |
| `/work-packages/{id}/authorize/` | POST |
| `/work-packages/{id}/start/` | POST |
| `/work-packages/{id}/complete/` | POST |
| `/board/` | GET, POST |
| `/board/{id}/add_member/` | POST |
| `/highlight-reports/` | GET, POST |
| `/end-project-report/` | GET, POST |
| `/lessons/` | GET, POST |
| `/tolerances/` | GET, POST |
| `/tolerances/initialize/` | POST |
| `/dashboard/` | GET |
