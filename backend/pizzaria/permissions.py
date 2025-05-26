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

class IsOwnerAndCanCancel(permissions.BasePermission):
    """
    Permite acesso apenas ao dono do pedido e apenas se o pedido
    puder ser cancelado (status 'Pendente', 'Recebido' ou 'Em Preparo').
    """
    message = "Você não tem permissão para cancelar este pedido."

    def has_object_permission(self, request, view, obj): # obj aqui é o Pedido
        # Verifica se o usuário está autenticado e tem um perfil de cliente associado
        if not (request.user and request.user.is_authenticated and hasattr(request.user, 'cliente')):
            self.message = "Apenas clientes autenticados podem cancelar pedidos."
            return False

        is_owner = obj.cliente == request.user.cliente

        if not is_owner:
            self.message = "Você só pode cancelar seus próprios pedidos."
            return False


        cancellable_statuses = ['Pendente', 'Recebido', 'Em Preparo']
        if obj.status not in cancellable_statuses:
            self.message = f"Pedidos com status '{obj.status}' não podem ser cancelados."
            return False

        return True