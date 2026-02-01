from django.contrib import admin
from .models import StatusReport, Meeting, ReportingItem

admin.site.register(StatusReport)
admin.site.register(Meeting)
admin.site.register(ReportingItem)
