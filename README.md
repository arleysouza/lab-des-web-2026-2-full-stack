# Aula 4 — Next.js full-stack

Aplicação didática com Next.js (App Router e TypeScript), Drizzle ORM e PostgreSQL. O Next.js executa a interface e o backend; o NestJS foi removido.

O CRUD de estudantes está completo. Cursos e matrículas permanecem no banco e nos schemas como exercícios: seus services, actions e telas devem ser desenvolvidos pelos alunos.

## Executar com Docker

Use Docker e Docker Compose. Na raiz:

```powershell
# Somente na primeira configuração:
Copy-Item .env.example .env
docker compose up -d --build
```

Abra http://localhost:8080/alunos. O PostgreSQL fica disponível externamente em localhost:5433. Configure FRONT_PORT_HOST, DB_PORT_HOST e as credenciais no .env da raiz.

O Compose inicia apenas database e front (a aplicação Next.js completa). O Next.js aguarda o banco ficar saudável e conecta internamente a database:5432.

```powershell
docker compose ps
docker compose logs -f front database
docker compose down
```

database/init.sql e database/seed.sql executam somente na primeira inicialização de um volume vazio. Os schemas Drizzle descrevem as tabelas para as consultas; não criam nem atualizam o banco automaticamente.

Ao migrar uma execução anterior, use docker compose up -d --build --remove-orphans para remover o contêiner antigo do NestJS deste projeto Compose.

## Desenvolvimento local

Use Node.js 24. Na raiz, inicie somente o banco:

```powershell
docker compose up -d database
cd front
npm ci
# Somente na primeira configuração:
Copy-Item .env.example .env.local
npm run dev
```

Abra http://localhost:3001/alunos. Configure front/.env.local:

```dotenv
DB_HOST=localhost
DB_PORT=5433
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=postgres
```

Se alterar as credenciais ou a porta publicada no .env da raiz, ajuste também .env.local. A conexão é exclusiva do servidor e não usa NEXT_PUBLIC_. API_URL e SERVER_PORT não são mais utilizados.

## Arquitetura

```text
front/src/
├── app/alunos/             Páginas, carregamento, erros e Server Actions
├── components/             Formulários interativos
├── services/students.ts    Consultas e persistência de estudantes
├── database/
│   ├── index.ts            Pool PostgreSQL e conexão Drizzle
│   └── schema.ts           Estudantes, cursos e matrículas
├── lib/
│   ├── validation.ts       Validação de RA
│   └── business-error.ts   Erros de negócio e códigos PostgreSQL
└── types/student.ts        Dados utilizados pelas telas
```

### Consultas

```text
Navegador → Server Component → service → Drizzle → PostgreSQL
```

As páginas chamam getStudents() e getStudent(ra) diretamente no servidor. Não há fetch HTTP intermediário nem useEffect para carregar a listagem. O layout de alunos mantém dynamic = "force-dynamic", renderizando por requisição; as consultas Drizzle não são envolvidas em cache.

O pool é inicializado sob demanda, permitindo compilar sem banco ou credenciais. Ele é reutilizado durante hot reload e limita conexões, espera e duração de consultas. Os módulos database e services importam server-only para impedir sua inclusão em Client Components.

### Alterações

```text
Formulário → Server Action → validação → service → Drizzle → PostgreSQL
```

Os formulários usam "use client" para estado e eventos. app/alunos/actions.ts usa "use server": o Next.js cuida da comunicação com essas funções no servidor.

As actions validam os tipos dos argumentos, RA inteiro entre 1 e 2147483647 e nome aparado de 3 a 100 caracteres. O RA não é alterado na edição. Os services usam consultas parametrizadas do Drizzle.

O banco garante unicidade e integridade referencial. Erros de RA duplicado, registro ausente e exclusão impedida por matrículas geram BusinessError com mensagem para o formulário. Erros inesperados ficam nos logs do servidor e geram mensagens genéricas ao usuário.

Atualização e exclusão verificam a existência do registro com returning() na própria operação. Após sucesso, a action executa revalidatePath("/alunos", "layout") e redirect(). O redirecionamento fica fora do try/catch porque interrompe a execução.

### Rotas e estados

As rotas são /alunos, /alunos/novo, /alunos/[ra], /alunos/[ra]/editar e /alunos/[ra]/remover.

- loading.tsx apresenta a espera durante a navegação.
- A listagem trata uma lista vazia.
- RA inválido ou estudante ausente aciona notFound().
- Falhas inesperadas nas consultas chegam a error.tsx.
- Erros nas alterações aparecem no formulário, preservando os campos.

Os antigos endpoints /api/students, /api/courses, /api/enrollments e /health foram removidos com o NestJS. Route Handlers podem ser um exercício posterior para expor uma API a outros clientes.

Este exemplo não possui autenticação: quem acessar pode consultar e alterar estudantes. Antes de disponibilizar a usuários reais, implemente autenticação e autorização nas operações do servidor.

## Verificação e roteiro de aula

Na pasta front:

```powershell
npm run build
npm run typecheck
```

Com a aplicação e o banco em execução:

1. Liste estudantes e abra os detalhes.
2. Cadastre um RA livre, edite o nome e remova o registro.
3. Tente repetir um RA e remover um estudante com matrícula.
4. Consulte /alunos/abc e um RA válido inexistente.
5. Pare o banco, recarregue e observe a interface de erro. Reinicie-o e tente novamente.
6. Acompanhe formulário → action → service → schema → banco no código.

## Exercícios

Implemente services, páginas, formulários e actions seguindo estudantes:

- Cursos: listar, consultar, cadastrar, editar e remover. O ID é gerado pelo banco; o nome deve ser único e ter de 3 a 100 caracteres. Cursos com matrículas não podem ser removidos.
- Matrículas: listar, consultar, cadastrar e remover pelo par studentRa e courseId. Não há atualização. Estudante e curso precisam existir e o par não pode se repetir.
- Use o schema de enrollments para estudar chave composta e relacionamentos. Consulte estudantes e cursos para apresentar os nomes.
- Inclua validação no servidor, carregamento, ausência de registro e conflitos. Use Server Actions para alterações e Server Components para consultas.
