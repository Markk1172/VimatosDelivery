# VimatosDelivery

## Descrição do Projeto

O VimatosDelivery é um sistema web completo de gerenciamento para uma pizzaria, alem da facilidade do cliente em pedir pizzas, é projetado para otimizar o processo de pedidos e entregas. A plataforma oferece uma interface intuitiva para clientes realizarem seus pedidos online e uma área administrativa para funcionários gerenciarem o cardápio, pedidos, clientes e entregadores.

Funcionalidades Principais:
* Visualização de cardápio (pizzas e bebidas).
* Cadastro e login de clientes.
* Realização de pedidos online.
* Carrinho de compras.
* Acompanhamento de status de pedidos.
* Gerenciamento de pedidos (fila de preparo).
* Cadastro de produtos, clientes, funcionários e motoboys.
* Cálculo de taxa de entrega (simulado).
* Calculo de frete, e busca por endereço automático

## Tecnologias Utilizadas

O projeto foi desenvolvido utilizando uma arquitetura Cliente-Servidor, com as seguintes tecnologias:

* **Backend:**
    * Python 3.x
    * Django
    * Django REST Framework
    * MySql (Banco de Dados padrão)

* **Frontend:**
    * React.js
    * JavaScript (ES6+)
    * HTML5
    * CSS3
    * Bootstrap
    * Axios (para requisições HTTP)

## Estrutura dos Arquivos

VimatosDelivery/
├── backend/                  # Contém o projeto Django (API)
│   ├── core/                 # Configurações principais do Django (settings.py, urls.py)
│   ├── pizzaria/             # Aplicação Django com a lógica da pizzaria (models.py, views.py, serializers.py, urls.py)
│   │   ├── migrations/       # Migrações do banco de dados
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── permissions.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   └── manage.py             # Utilitário de linha de comando do Django
├── frontend1/                # Contém o projeto React (Interface do Usuário)
│   ├── public/               # Arquivos estáticos e index.html
│   │   ├── assets/
│   │   └── index.html
│   ├── src/                  # Código fonte do React
│   │   ├── assets/           # CSS e JS globais
│   │   ├── components/       # Componentes React reutilizáveis (Navbar, Cardapio, Carrinho, etc.)
│   │   ├── App.js            # Componente principal da aplicação
│   │   ├── App.css
│   │   ├── index.js          # Ponto de entrada da aplicação React
│   │   └── index.css
│   ├── package.json          # Dependências e scripts do Node.js
│   └── package-lock.json
└── README.md                 # Este arquivo

## Instruções de Execução

Siga os passos abaixo para configurar e executar o projeto localmente.

### Pré-requisitos

* Python 3.8 ou superior
* Node.js e npm (ou yarn)
* Servidor MySQL instalado e rodando.

### Backend (Django)

1.  **Configure o Banco de Dados:**
    * Crie um banco de dados MySQL chamado `Vimatos`.
    * Certifique-se de que o usuário `root` com senha `root` tenha acesso a ele, ou ajuste as credenciais em `backend/core/settings.py`.
2.  **Navegue até o diretório do backend:**
    ```bash
    cd backend
    ```
3.  **(Opcional, mas recomendado) Crie e ative um ambiente virtual:**
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```
4.  **Instale as dependências Python:**
    ```bash
    pip install -r requirements.txt
    ```
5.  **(Opcional) Crie um arquivo `.env`:** Na pasta `backend/`, crie um arquivo `.env` para armazenar chaves de API, se desejar mantê-las fora do `settings.py`. Adicione suas chaves ORS\_API\_KEY e GEOAPIFY\_API\_KEY lá.
    ```env
    ORS_API_KEY=sua_chave_aqui
    GEOAPIFY_API_KEY=sua_chave_aqui
    ```
6.  **Aplique as migrações do banco de dados:**
    ```bash
    python manage.py migrate
    ```
7.  **Crie um superusuário para acessar a área administrativa (opcional):**
    ```bash
    python manage.py createsuperuser
    ```
8.  **Inicie o servidor de desenvolvimento do backend:**
    ```bash
    python manage.py runserver
    ```
    O backend estará rodando em `http://127.0.0.1:8000/`.

### Frontend (React)

1.  **Abra um novo terminal e navegue até o diretório do frontend:**
    ```bash
    cd frontend1
    ```
2.  **Instale as dependências Node.js:**
    ```bash
    npm install
    ```
    *ou, se preferir usar yarn:*
    ```bash
    yarn install
    ```
3.  **Inicie o servidor de desenvolvimento do frontend:**
    ```bash
    npm start
    ```
    *ou:*
    ```bash
    yarn start
    ```
    A aplicação frontend estará acessível em `http://localhost:3000/`. Ela se comunicará automaticamente com o backend.

    ## Integrantes do Grupo

* Amanda Beatriz Guimarães Alves - RGM : 38746689 
* Gabriel Oliveira dos Santos - RGM : 38769662
* Gustavo Couto Carvalho - RGM : 38410702
* Marcos Vinícius de Souza Duarte - RGM : 38231590
* Matheus Araujo dos Santos - RGM : 38387361
* Raul Acântara da Silva - RGM : 38320771 
* Victória Kethelen Alves da Silva - RGM : 38386763

