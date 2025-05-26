from rest_framework import permissions

# Permissão personalizada para verificar se o usuário é um funcionário.
# Esta classe é usada para restringir o acesso a endpoints específicos da API,
# garantindo que apenas usuários autenticados que possuam um perfil
# de 'Funcionario' vinculado possam acessá-los. Ideal para views de
# gerenciamento interno ou administrativo.
class IsFuncionario(permissions.BasePermission):
    """
    Permite acesso apenas a usuários autenticados que são funcionários.
    """

    # Verifica a permissão em nível de view (lista ou antes de obter o objeto).
    # Retorna True se o usuário da requisição existe, está autenticado
    # e possui o atributo 'funcionario' (indicando que é um funcionário),
    # caso contrário, retorna False.
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'funcionario')
        )

# Permissão personalizada para verificar se o usuário é o dono de um pedido
# e se este pedido ainda pode ser cancelado.
# Utilizada em endpoints que permitem o cancelamento de pedidos, garantindo
# que apenas o cliente que fez o pedido possa cancelá-lo, e somente se
# o pedido não estiver em um estágio avançado (como "Em Rota" ou "Entregue").
class IsOwnerAndCanCancel(permissions.BasePermission):
    """
    Permite acesso ao dono do pedido apenas se o status permitir cancelamento.
    """
    # Mensagem padrão exibida caso a permissão seja negada.
    # Pode ser sobrescrita dentro de `has_object_permission` para dar feedback específico.
    message = "Você não tem permissão para realizar esta ação neste pedido."

    # Verifica a permissão em nível de objeto (detalhe, após obter o objeto).
    # 'obj' neste contexto é a instância do modelo Pedido.
    # A lógica verifica:
    # 1. Se o usuário é um cliente autenticado.
    # 2. Se o cliente autenticado é o mesmo cliente associado ao pedido ('obj').
    # 3. Se o status atual do pedido está na lista de status canceláveis.
    # Se qualquer uma dessas condições falhar, define uma mensagem de erro
    # específica e retorna False. Caso contrário, retorna True.
    def has_object_permission(self, request, view, obj): # obj aqui é o Pedido
        # Verifica se o usuário é um cliente autenticado.
        if not (request.user and request.user.is_authenticated and hasattr(request.user, 'cliente')):
            self.message = "Apenas clientes autenticados podem cancelar pedidos."
            return False

        # Verifica se o cliente da requisição é o dono do pedido.
        is_owner = obj.cliente == request.user.cliente

        if not is_owner:
            self.message = "Você só pode cancelar seus próprios pedidos."
            return False

        # Define os status em que um pedido pode ser cancelado.
        cancellable_statuses = ['Pendente', 'Recebido', 'Em Preparo']
        # Verifica se o status atual do pedido permite cancelamento.
        if obj.status not in cancellable_statuses:
            self.message = f"Pedidos com status '{obj.get_status_display()}' não podem ser cancelados."
            return False

        # Se todas as verificações passarem, a permissão é concedida.
        return True