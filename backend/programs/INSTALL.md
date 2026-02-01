# Programs Django App - Installation Guide

## Files Included
- `models.py` - Program, ProgramBenefit, ProgramRisk, ProgramMilestone models
- `serializers.py` - DRF serializers for all models
- `views.py` - ViewSets with CRUD operations and custom actions
- `urls.py` - URL routing (requires drf-nested-routers)
- `urls_simple.py` - Alternative URL routing (no extra dependencies)
- `admin.py` - Django admin configuration
- `apps.py` - Django app configuration

## Installation Steps

### 1. Create the programs app folder
```bash
cd backend
mkdir programs
```

### 2. Copy all files to the programs folder
```bash
cp models.py serializers.py views.py admin.py apps.py ../backend/programs/
# Use urls_simple.py if you don't have drf-nested-routers:
cp urls_simple.py ../backend/programs/urls.py
# Or use urls.py if you have drf-nested-routers installed
```

### 3. Create `__init__.py`
```bash
touch programs/__init__.py
```

### 4. Add to INSTALLED_APPS in settings.py
```python
INSTALLED_APPS = [
    # ... other apps
    'programs',
]
```

### 5. Include URLs in main urls.py
```python
# In your main urls.py (e.g., core/urls.py or backend/urls.py)
urlpatterns = [
    # ... other paths
    path('api/v1/', include('programs.urls')),
]
```

### 6. Run migrations
```bash
python manage.py makemigrations programs
python manage.py migrate
```

### 7. (Optional) Install drf-nested-routers for nested URLs
```bash
pip install drf-nested-routers
```
Then use `urls.py` instead of `urls_simple.py`

## API Endpoints

### Programs
- `GET /api/v1/programs/` - List all programs
- `POST /api/v1/programs/` - Create a program
- `GET /api/v1/programs/{id}/` - Get program details
- `PATCH /api/v1/programs/{id}/` - Update program
- `DELETE /api/v1/programs/{id}/` - Delete program
- `GET /api/v1/programs/{id}/projects/` - Get linked projects
- `POST /api/v1/programs/{id}/add_project/` - Add project to program
- `DELETE /api/v1/programs/{id}/projects/{project_id}/` - Remove project
- `GET /api/v1/programs/{id}/metrics/` - Get program metrics
- `GET /api/v1/programs/{id}/dashboard/` - Get dashboard data

### Program Benefits
- `GET /api/v1/programs/{id}/benefits/` - List benefits
- `POST /api/v1/programs/{id}/benefits/` - Create benefit
- `GET /api/v1/programs/{id}/benefits/{benefit_id}/` - Get benefit
- `PATCH /api/v1/programs/{id}/benefits/{benefit_id}/` - Update benefit
- `DELETE /api/v1/programs/{id}/benefits/{benefit_id}/` - Delete benefit

### Program Risks
- `GET /api/v1/programs/{id}/risks/` - List risks
- `POST /api/v1/programs/{id}/risks/` - Create risk
- `GET /api/v1/programs/{id}/risks/{risk_id}/` - Get risk
- `PATCH /api/v1/programs/{id}/risks/{risk_id}/` - Update risk
- `DELETE /api/v1/programs/{id}/risks/{risk_id}/` - Delete risk

### Program Milestones
- `GET /api/v1/programs/{id}/milestones/` - List milestones
- `POST /api/v1/programs/{id}/milestones/` - Create milestone
- etc.

## Query Parameters

Programs list supports filtering:
- `?status=active` - Filter by status
- `?methodology=safe` - Filter by methodology
- `?search=digital` - Search by name/description

## Creating a Program (Example)

```json
POST /api/v1/programs/
{
    "name": "Digital Transformation 2025",
    "description": "Enterprise-wide digital transformation initiative",
    "methodology": "safe",
    "status": "active",
    "start_date": "2025-01-01",
    "target_end_date": "2025-12-31",
    "total_budget": 1500000,
    "currency": "EUR",
    "program_manager": 1,
    "project_ids": [1, 2, 3]
}
```

## Frontend Integration

After installing the backend, update your frontend `api.ts`:

```typescript
export const programsApi = {
  getAll: (params?) => api.get('/programs/', params),
  getById: (id) => api.get(`/programs/${id}/`),
  create: (data) => api.post('/programs/', data),
  update: (id, data) => api.patch(`/programs/${id}/`, data),
  delete: (id) => api.delete(`/programs/${id}/`),
  getProjects: (programId) => api.get(`/programs/${programId}/projects/`),
  addProject: (programId, projectId) => api.post(`/programs/${programId}/add_project/`, { project_id: projectId }),
  getMetrics: (programId) => api.get(`/programs/${programId}/metrics/`),
  getDashboard: (programId) => api.get(`/programs/${programId}/dashboard/`),
};
```
