# URL Shortener Project 🚀

Bem-vindo ao projeto de Encurtador de URLs! Este é um sistema completo desenvolvido para encurtar URLs longas, permitindo uma melhor gestão e compartilhamento de links. O projeto está estruturado como um **monorepo**, incluindo serviços separados para backend, frontend e gerenciamento de identidade e acesso via **Keycloak**.

## Índice

- [Descrição do Projeto](#descrição-do-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Funcionalidades](#funcionalidades)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Configurações de Ambiente](#configurações-de-ambiente)
- [Como Utilizar](#como-utilizar)
- [Pontos de Melhoria](#pontos-de-melhoria)
- [Licença](#licença)

---

## Descrição do Projeto

Este projeto tem como objetivo fornecer um sistema de encurtamento de URLs robusto e escalável, com recursos avançados como autenticação de usuários, gerenciamento de URLs encurtadas, contabilização de acessos e muito mais. O sistema é construído com foco em escalabilidade vertical e utiliza tecnologias modernas para garantir desempenho e segurança.

## Tecnologias Utilizadas

- **Node.js** v20
- **NestJS** v10
- **Angular** v18
- **PostgreSQL** como banco de dados relacional
- **Keycloak** para gerenciamento de identidade e acesso
- **Docker** e **Docker Compose** para containerização
- **Nginx** como servidor web para o frontend

## Funcionalidades

- **Encurtamento de URLs**: Qualquer usuário pode encurtar uma URL longa.
- **Autenticação de Usuários**: Sistema de registro e autenticação de usuários via Keycloak.
- **Gerenciamento de URLs**: Usuários autenticados podem listar, editar e excluir suas URLs encurtadas.
- **Contabilização de Acessos**: Cada acesso a uma URL encurtada é contabilizado.
- **Atualização de Registros**: Todos os registros possuem informações sobre a última atualização.
- **Exclusão Lógica**: Registros são excluídos logicamente, mantendo a integridade dos dados.
- **Multi-Tenancy**: Suportado via Keycloak para gerenciamento de múltiplos clientes/usuários.

## Arquitetura do Sistema

- **Monorepo**: Estrutura que reúne backend, frontend e configurações em um único repositório.
- **Backend**: API RESTful construída com NestJS, seguindo a Maturidade 2 da API REST.
- **Frontend**: Aplicação web construída com Angular, consumindo a API do backend.
- **Keycloak**: Gerencia a autenticação dos usuários.
- **Banco de Dados**: PostgreSQL para armazenamento de dados relacionais.
- **Containerização**: Docker e Docker Compose para facilitar a execução e o deploy do sistema.
- **Exportação do Realm do Keycloak**: O projeto inclui um export do realm que é importado automaticamente no Docker Compose.

## Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas em sua máquina:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Instalação e Execução

### 1. Clone o Repositório

```bash
git clone https://github.com/rphmota/short-url.git
cd short-url
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo .env dentro do diretório backend/ com as seguintes configurações:

```bash
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASS=postgres
DATABASE_NAME=url

PORT=3000

# Configurações do Keycloak
KEYCLOAK_AUTH_SERVER_URL=http://keycloak:8080
KEYCLOAK_REALM=url-shortener
KEYCLOAK_CLIENT_ID=url-shortener-client
KEYCLOAK_CLIENT_SECRET=**********
```

Nota: Para ambiente de desenvolvimento local, substitua os valores das variáveis de host por localhost:

```bash
DATABASE_HOST=localhost
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8090
```

### 3. Subir o Ambiente com Docker Compose

```bash
docker-compose up -d
```

Este comando irá construir as imagens Docker e iniciar todos os serviços necessários:

Backend na porta 3000
Frontend na porta 4200
Keycloak na porta 8090
PostgreSQL na porta 5432

### 4. Acessar a Aplicação

Frontend: http://localhost:4200

Backend : http://localhost:3000

Swagger : http://localhost:3000/api

Keycloak: http://localhost:8090

### Configurações de Ambiente

Variáveis de Ambiente do Backend
As seguintes variáveis de ambiente são utilizadas pelo backend:

DATABASE_HOST: Host do banco de dados (use db ou localhost)

DATABASE_PORT: Porta do banco de dados (padrão 5432)

DATABASE_USER: Usuário do banco de dados (padrão postgres)

DATABASE_PASS: Senha do banco de dados (padrão postgres)

DATABASE_NAME: Nome do banco de dados (padrão url)

PORT: Porta em que o backend irá rodar (padrão 3000)

### Configurações do Keycloak

KEYCLOAK_AUTH_SERVER_URL: URL do servidor Keycloak (use http://localhost:8090)
KEYCLOAK_REALM: Nome do realm do Keycloak (padrão url-shortener)

KEYCLOAK_CLIENT_ID: ID do cliente configurado no Keycloak (padrão url-shortener-client)

KEYCLOAK_CLIENT_SECRET: Segredo do cliente no Keycloak (pode usar \***\*\*\*\*\*** para testes)

Observação: O projeto inclui um arquivo de exportação do realm (realm-export.json) que é importado automaticamente pelo Keycloak durante a inicialização via Docker Compose. Caso deseje, você pode criar um novo realm e atualizar as configurações conforme necessário.

### Como Utilizar

1. Encurtar uma URL

- Acesse a aplicação no navegador: http://localhost:4200
- Utilize o formulário para inserir uma URL longa e obter a versão encurtada.
- Qualquer usuário (autenticado ou não) pode encurtar URLs.

2. Autenticar-se no Sistema

- Clique em "Signup" para ser redirecionado para o formulario.
- Crie uma nova conta.
- Acesse o login e entre com suas credenciais

3. Gerenciar URLs Encurtadas

- Usuários autenticados podem:
- Listar suas URLs encurtadas.
- Editar o endereço de destino das URLs.
- Excluir URLs (exclusão lógica).
- Visualizar a quantidade de cliques em cada URL.

4. Redirecionamento de URLs

- Acesse uma URL encurtada para ser redirecionado ao endereço original.
- Cada acesso é contabilizado e atualizado no sistema.

### Pontos de Melhoria

- Implementar Validação com Zod: Adicionar validação de entrada no backend utilizando a biblioteca Zod para garantir a integridade dos dados.
- Integração com KrakenD: Embora o KrakenD nao esteja configurado, há espaço para aprimorar a integração e adicionar funcionalidades avançadas de gateway.
- Ambiente SonarQube: Integrar uma ferramenta de análise de código como o SonarQube para melhorar a qualidade do código.

### Licença

Este projeto está licenciado sob a MIT License.

# Obrigado por conferir o projeto!
