from rest_framework.permissions import BasePermission

ADMIN_ROLES = {'admin'}
WORKER_ROLES = {'admin', 'worker', 'surveyor'}
STAFF_ROLES = {'admin', 'surveyor', 'real_estate_manager', 'worker'}


class IsAdmin(BasePermission):
    """Only admin users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ADMIN_ROLES)


class IsAdminOrWorker(BasePermission):
    """Admin or worker/secretary can write data."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in WORKER_ROLES)


class IsStaff(BasePermission):
    """Any internal staff role (not customer)."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in STAFF_ROLES)
