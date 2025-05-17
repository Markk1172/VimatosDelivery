from rest_framework import permissions


class IsFuncionario(permissions.BasePermission):
    """
    Permite acesso apenas se o usuário está autenticado e é funcionário.
    Supondo que você tenha um modelo Funcionario relacionado ao User.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and
            hasattr(request.user, 'funcionario')
        )