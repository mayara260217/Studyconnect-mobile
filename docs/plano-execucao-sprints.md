# Plano de Execução por Sprints — StudyConnect Mobile

> **Para quem é este documento?**
> Para programadores em nível trainee (iniciante). Cada seção explica o "porquê" antes do "como".
> Todos os códigos alterados terão comentários explicativos.

---

## 1. O que é uma Sprint?

Uma **sprint** é um bloco de trabalho com começo, meio e fim definidos (geralmente 1 semana).
Ao final de cada sprint, o que foi feito deve estar **funcionando e testado** — não "quase pronto".

Regra de ouro: **a próxima sprint só começa quando a anterior estiver com todos os testes passando.**

---

## 2. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONT-END (Mobile)                          │
│  React Native + Expo  —  pasta: Studyconnect-mobile             │
│                                                                 │
│  app/              → telas (o que o usuário vê)                 │
│  contexts/         → estado global (quem está logado, etc.)     │
│  utils/api.ts      → URL base do servidor                       │
│  utils/storage.ts  → salva dados no celular (SecureStore)       │
└───────────────────────────┬─────────────────────────────────────┘
                            │  HTTP + JSON
                            │  http://10.0.2.2:8080/api/v1
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACK-END (Servidor)                         │
│  Spring Boot + Java  —  pasta: studyconnect-backend-1           │
│                                                                 │
│  controller/  → recebe as requisições HTTP                      │
│  services/    → regras de negócio (a "inteligência")            │
│  repository/  → consultas no banco de dados                     │
│  dto/         → objetos que trafegam entre front e back         │
│  entity/      → representação das tabelas do banco              │
│  security/    → autenticação JWT e controle de acesso           │
└─────────────────────────────────────────────────────────────────┘
```

### Por que 10.0.2.2 e não localhost?

> No emulador Android, `localhost` aponta para o próprio emulador.
> Para acessar o servidor rodando na sua máquina, use `10.0.2.2`.
> Em dispositivo físico, use o IP da sua máquina na rede Wi-Fi (ex: `192.168.1.x`).

---

## 3. Mapeamento: Telas × Rotas do Back-end

| Tela (Mobile)       | Rota Back-end                          | Método | Status       |
|---------------------|----------------------------------------|--------|--------------|
| `login.tsx`         | `/api/v1/auth/login`                   | POST   | ✅ Integrado  |
| `cadastro.tsx`      | `/api/v1/usuarios`                     | POST   | 🔲 Pendente  |
| `verificar-email.tsx` | `/api/v1/auth/verify-email`          | POST   | ✅ Integrado  |
| `verificar-email.tsx` | `/api/v1/auth/resend-verification`   | POST   | ✅ Integrado  |
| `(tabs)/index.tsx`  | `/api/v1/progresso/aluno/{id}`         | GET    | 🔲 Pendente  |
| `(tabs)/biblioteca.tsx` | `/api/v1/trilhas`                  | GET    | 🔲 Pendente  |
| `(tabs)/ranking.tsx`| *(sem rota de ranking no back-end)*    | —      | 🔲 A criar   |
| `(tabs)/perfil.tsx` | `/api/v1/usuarios/{id}`                | GET    | 🔲 Pendente  |
| `editar-perfil.tsx` | `/api/v1/usuarios/{id}`                | PUT    | 🔲 Pendente  |
| `configuracoes.tsx` | `/api/v1/usuarios/{id}`                | DELETE | 🔲 Pendente  |

---

## 4. Princípios Aplicados

| Princípio | O que significa aqui |
|-----------|----------------------|
| **Clean Code** | Nomes claros, funções pequenas, sem código morto |
| **SOLID** | Cada arquivo/função tem uma única responsabilidade |
| **MVC** | Controller recebe, Service processa, Repository persiste |
| **DDD** | O código reflete o vocabulário do negócio (aluno, trilha, matrícula) |
| **TDD** | Escreve o teste antes (ou junto) da implementação |
| **Coesão alta** | Cada módulo faz bem uma coisa só |
| **Baixo acoplamento** | Módulos não dependem diretamente uns dos outros — usam interfaces/contratos |

---

## 5. Ferramentas de Teste

| Ferramenta | Onde usar | O que testa |
|------------|-----------|-------------|
| **JUnit 5 + Mockito** | Back-end (Java) | Funções isoladas sem banco |
| **Jest** | Front-end (TypeScript) | Funções e hooks isolados |
| **Playwright** | E2E (ponta a ponta) | Fluxo completo via navegador/emulador |

> **O que é E2E?**
> Testa o sistema como um usuário real faria: abre a tela, preenche campos, clica no botão
> e verifica se o resultado esperado apareceu. Usa o Playwright para automatizar isso.

---

## Sprint 0 — Fundação: Ambiente, Estrutura e Contrato de API

**Duração sugerida:** 3 dias
**Objetivo:** preparar o terreno antes de escrever qualquer integração.

### O que fazer

#### 0.1 — Criar pasta `docs/` no projeto mobile
Documentação vive junto com o código. Este arquivo já está aqui.

#### 0.2 — Criar `utils/api.ts` com cliente HTTP centralizado

> **Por quê?** Hoje cada tela chama `fetch` diretamente com a URL escrita na mão.
> Se a URL mudar, precisaria alterar em 10 lugares. Com um cliente centralizado, muda em 1.

Arquivo: `utils/api.ts`

```typescript
// utils/api.ts
// Centraliza todas as chamadas HTTP do app.
// "authFetch" adiciona automaticamente o token JWT no cabeçalho.

import { getItem } from './storage';

// URL base do servidor. Vem do arquivo .env
// 10.0.2.2 = localhost da máquina host visto pelo emulador Android
export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api/v1';

// Chave usada para salvar/ler o token JWT no SecureStore
export const TOKEN_KEY = 'studyconnect_token';

/**
 * Faz uma requisição HTTP autenticada.
 * Lê o token salvo no celular e coloca no cabeçalho Authorization.
 * Use esta função em todas as telas que precisam de login.
 */
export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  // Lê o token JWT salvo após o login
  const token = await getItem(TOKEN_KEY);

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Se tiver token, adiciona no cabeçalho. Senão, não adiciona nada.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Permite que o chamador adicione cabeçalhos extras
      ...options.headers,
    },
  });
}
```

#### 0.3 — Configurar Playwright para testes E2E

```bash
# Rodar na pasta do projeto mobile
npm install --save-dev @playwright/test
npx playwright install
```

Criar arquivo `playwright.config.ts` na raiz:

```typescript
// playwright.config.ts
// Configuração do Playwright para testes E2E do app web (Expo Web)
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Pasta onde ficam os arquivos de teste E2E
  testDir: './e2e',
  // Tempo máximo que um teste pode demorar (30 segundos)
  timeout: 30_000,
  use: {
    // URL do app rodando em modo web (expo start --web)
    baseURL: 'http://localhost:8081',
  },
});
```

Criar pasta `e2e/` na raiz do projeto mobile.

#### 0.4 — Configurar Jest para testes unitários

```bash
npm install --save-dev jest @testing-library/react-native jest-expo
```

Adicionar em `package.json`:
```json
"jest": {
  "preset": "jest-expo",
  "setupFilesAfterFramework": ["@testing-library/react-native/extend-expect"]
}
```

### Critério de aceite
- [ ] `utils/api.ts` exporta `API_BASE`, `TOKEN_KEY` e `authFetch`
- [ ] `npx playwright install` roda sem erros
- [ ] `npx jest` roda sem erros (mesmo sem testes ainda)

---

## Sprint 1 — Login: Integração, Testes Unitários e E2E

**Duração sugerida:** 1 semana
**Objetivo:** conectar a tela de login ao back-end, cobrir com testes unitários e E2E.

### Contexto: como o login funciona

```
Usuário digita e-mail e senha
  → login.tsx chama handleLogin()
    → auth-context.tsx chama login(email, senha)
      → POST http://10.0.2.2:8080/api/v1/auth/login
        → Back-end valida credenciais
        → Retorna JWT + dados do usuário
      → App salva JWT no SecureStore
      → App navega para /(tabs)
```

### Contrato da API (o que o back-end espera e retorna)

**Requisição:**
```json
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "aluno@email.com", "senha": "Senha@123" }
```

**Resposta de sucesso (200):**
```json
{
  "id": 1,
  "nome": "Ana Silva",
  "role": "ALUNO",
  "fotoUrl": null,
  "email": "aluno@email.com",
  "ativo": true,
  "accessToken": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

**Respostas de erro:**
| HTTP | Motivo |
|------|--------|
| 401  | E-mail ou senha incorretos |
| 403  | E-mail não verificado |
| 403  | Conta suspensa |

### 1.1 — Atualizar `auth-context.tsx`

O que muda:
- Função `login` deixa de ser mock e chama a API real
- JWT é salvo no `SecureStore` após login bem-sucedido
- Função `logout` apaga o JWT do storage
- Erro de e-mail não verificado é relançado para a tela tratar

```typescript
// Chave para salvar o token JWT no SecureStore do celular
const TOKEN_KEY = 'studyconnect_token';

async function login(email: string, senha: string): Promise<boolean> {
  // Validação básica antes de chamar a API
  if (!email.trim() || !senha.trim()) return false;

  try {
    // Chama o back-end com e-mail e senha
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), senha }),
    });

    // Se não for 200, verifica o tipo de erro
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg: string = err?.message ?? '';

      // 403 com "verificado" = e-mail ainda não confirmado
      if (res.status === 403 && msg.toLowerCase().includes('verificado')) {
        throw new Error('email_nao_verificado');
      }
      // Qualquer outro erro = credenciais inválidas
      return false;
    }

    // Login bem-sucedido: salva o token e os dados do usuário
    const data = await res.json();
    await setItem(TOKEN_KEY, data.accessToken);
    salvarUser(normalizarUser({
      nome: data.nome,
      email: data.email,
      foto: data.fotoUrl ?? null,
    }));
    return true;

  } catch (e: any) {
    // Relança o erro de e-mail não verificado para a tela tratar
    if (e?.message === 'email_nao_verificado') throw e;
    // Qualquer outro erro (rede, timeout) retorna false
    return false;
  }
}

function logout() {
  setUser(null);
  // Apaga dados do usuário E o token JWT
  deleteItem(USER_KEY);
  deleteItem(TOKEN_KEY);
}
```

### 1.2 — Atualizar `login.tsx`

O que muda:
- `handleLogin` usa `try/catch/finally` para tratar todos os erros
- Mensagem específica para e-mail não verificado
- `setLoading(false)` garantido no `finally` (evita tela travada)
- Adicionar `testID` nos campos para os testes E2E encontrarem os elementos

```typescript
async function handleLogin() {
  if (!email.trim() || !senha.trim()) {
    Alert.alert('Atenção', 'Preencha e-mail e senha.');
    return;
  }
  setLoading(true);
  try {
    const ok = await login(email, senha);
    if (ok) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Erro', 'Credenciais inválidas.');
    }
  } catch (e: any) {
    if (e?.message === 'email_nao_verificado') {
      Alert.alert('E-mail não verificado', 'Verifique sua caixa de entrada antes de entrar.');
    } else {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    }
  } finally {
    // finally sempre executa, mesmo se der erro — garante que o loading some
    setLoading(false);
  }
}
```

Adicionar `testID` nos elementos interativos:
```tsx
<TextInput testID="input-email" ... />
<TextInput testID="input-senha" ... />
<TouchableOpacity testID="btn-entrar" ... />
```

### 1.3 — Testes Unitários (Jest)

Criar `__tests__/auth-login.test.ts`:

```typescript
// __tests__/auth-login.test.ts
// Testa a lógica de login SEM abrir o app e SEM precisar do servidor rodando.
// Usamos jest.fn() para "fingir" que o fetch foi chamado e retornou algo.

describe('login()', () => {

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('retorna true quando credenciais são válidas', async () => {
    // Simula o servidor retornando 200 com token
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        accessToken: 'token-fake',
        nome: 'Ana',
        email: 'ana@email.com',
        fotoUrl: null,
      }),
    } as any);

    // Chama a função real de login
    const resultado = await login('ana@email.com', 'Senha@123');
    expect(resultado).toBe(true);
  });

  it('retorna false quando senha está errada (401)', async () => {
    // Simula o servidor retornando 401
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'E-mail ou senha incorretos' }),
    } as any);

    const resultado = await login('ana@email.com', 'senhaerrada');
    expect(resultado).toBe(false);
  });

  it('lança erro email_nao_verificado quando conta não foi confirmada', async () => {
    // Simula o servidor retornando 403 com mensagem de verificação
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ message: 'E-mail nao verificado' }),
    } as any);

    await expect(login('ana@email.com', 'Senha@123'))
      .rejects.toThrow('email_nao_verificado');
  });

  it('retorna false quando não há conexão com o servidor', async () => {
    // Simula falha de rede
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));

    const resultado = await login('ana@email.com', 'Senha@123');
    expect(resultado).toBe(false);
  });

  it('retorna false quando e-mail ou senha estão vazios', async () => {
    const resultado = await login('', '');
    expect(resultado).toBe(false);
    // fetch não deve ser chamado se os campos estiverem vazios
    expect(fetch).not.toHaveBeenCalled();
  });
});
```

### 1.4 — Testes E2E (Playwright)

Criar `e2e/login.spec.ts`:

```typescript
// e2e/login.spec.ts
// Testa o fluxo completo de login como se fosse um usuário real.
// O Playwright abre o navegador, preenche os campos e verifica o resultado.
// ATENÇÃO: o servidor back-end precisa estar rodando para estes testes funcionarem.

import { test, expect } from '@playwright/test';

test.describe('Tela de Login', () => {

  test.beforeEach(async ({ page }) => {
    // Abre a tela de login antes de cada teste
    await page.goto('/login');
  });

  test('deve navegar para home após login com credenciais válidas', async ({ page }) => {
    // Preenche o campo de e-mail
    await page.getByTestId('input-email').fill('aluno@email.com');
    // Preenche o campo de senha
    await page.getByTestId('input-senha').fill('Senha@123');
    // Clica no botão Entrar
    await page.getByTestId('btn-entrar').tap();
    // Verifica se foi para a tela principal
    await expect(page).toHaveURL(/tabs/);
  });

  test('deve mostrar alerta quando senha está errada', async ({ page }) => {
    await page.getByTestId('input-email').fill('aluno@email.com');
    await page.getByTestId('input-senha').fill('senhaerrada');
    await page.getByTestId('btn-entrar').tap();
    // Verifica se o alerta de erro apareceu
    await expect(page.getByText('Credenciais inválidas')).toBeVisible();
  });

  test('deve mostrar alerta quando campos estão vazios', async ({ page }) => {
    // Clica em Entrar sem preencher nada
    await page.getByTestId('btn-entrar').tap();
    await expect(page.getByText('Preencha e-mail e senha')).toBeVisible();
  });

  test('deve mostrar alerta específico para e-mail não verificado', async ({ page }) => {
    await page.getByTestId('input-email').fill('naoverificado@email.com');
    await page.getByTestId('input-senha').fill('Senha@123');
    await page.getByTestId('btn-entrar').tap();
    await expect(page.getByText('E-mail não verificado')).toBeVisible();
  });

});
```

### Critério de aceite da Sprint 1
- [ ] Login funciona com credenciais reais do banco de dados
- [ ] JWT é salvo no SecureStore após login
- [ ] Logout apaga o JWT
- [ ] `npx jest` passa com os 5 testes unitários
- [ ] `npx playwright test` passa com os 4 testes E2E
- [ ] Nenhuma outra tela foi quebrada

---

## Sprint 2 — Cadastro: Integração, Testes Unitários e E2E

**Duração sugerida:** 1 semana
**Objetivo:** conectar a tela de cadastro ao back-end e redirecionar para verificação de e-mail.

### Contexto

Hoje `cadastro.tsx` chama `cadastrar()` do `auth-context`, que ainda é um mock.
O back-end já tem a rota `POST /api/v1/usuarios` pronta.

### Contrato da API

**Requisição:**
```json
POST /api/v1/usuarios
Content-Type: application/json

{ "nome": "Ana Silva", "email": "ana@email.com", "senha": "Senha@123" }
```

**Resposta de sucesso (201):**
```json
{ "id": 1, "nome": "Ana Silva", "email": "ana@email.com", "tipoUsuario": "ALUNO", "ativo": false }
```

**Respostas de erro:**
| HTTP | Motivo |
|------|--------|
| 400  | Dados inválidos (senha fraca, e-mail mal formatado) |
| 409  | E-mail já cadastrado |

### 2.1 — Atualizar `auth-context.tsx` — função `cadastrar`

```typescript
async function cadastrar(nome: string, email: string, senha: string): Promise<boolean | 'verificar'> {
  if (!nome.trim() || !email.trim() || !senha.trim()) return false;

  try {
    const res = await fetch(`${API_BASE}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // O back-end espera exatamente estes campos
      body: JSON.stringify({ nome: nome.trim(), email: email.trim().toLowerCase(), senha }),
    });

    if (res.status === 409) {
      // 409 Conflict = e-mail já existe no banco
      throw new Error('email_ja_cadastrado');
    }
    if (!res.ok) return false;

    // Cadastro criado com sucesso — usuário precisa verificar o e-mail
    return 'verificar';

  } catch (e: any) {
    if (e?.message === 'email_ja_cadastrado') throw e;
    return false;
  }
}
```

### 2.2 — Atualizar `cadastro.tsx`

O que muda:
- Após cadastro bem-sucedido, redireciona para `verificar-email` passando o e-mail
- Trata erro de e-mail já cadastrado com mensagem específica
- Adiciona `testID` nos campos

```typescript
async function handleCadastro() {
  // ... validações existentes mantidas ...
  setLoading(true);
  try {
    const resultado = await cadastrar(nome, email, senha);
    if (resultado === 'verificar') {
      // Redireciona para a tela de verificação passando o e-mail como parâmetro
      router.replace({ pathname: '/verificar-email', params: { email } });
    } else {
      Alert.alert('Erro', 'Não foi possível criar a conta.');
    }
  } catch (e: any) {
    if (e?.message === 'email_ja_cadastrado') {
      Alert.alert('E-mail já cadastrado', 'Tente fazer login ou recuperar sua senha.');
    } else {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    }
  } finally {
    setLoading(false);
  }
}
```

### 2.3 — Testes Unitários

Criar `__tests__/auth-cadastro.test.ts` com os cenários:

| Cenário | Simulação | Resultado esperado |
|---------|-----------|-------------------|
| Cadastro válido | 201 Created | retorna `'verificar'` |
| E-mail duplicado | 409 Conflict | lança `email_ja_cadastrado` |
| Dados inválidos | 400 Bad Request | retorna `false` |
| Sem conexão | fetch lança TypeError | retorna `false` |
| Campos vazios | — | retorna `false` sem chamar fetch |

### 2.4 — Testes E2E

Criar `e2e/cadastro.spec.ts` com os cenários:

| Cenário | Ação | Verificação |
|---------|------|-------------|
| Cadastro válido | preenche tudo corretamente | navega para verificar-email |
| Senhas diferentes | confirmar ≠ senha | alerta "As senhas não coincidem" |
| E-mail duplicado | e-mail já existente | alerta "E-mail já cadastrado" |
| Campos vazios | clica sem preencher | alerta "Preencha todos os campos" |

### Critério de aceite da Sprint 2
- [ ] Cadastro cria usuário real no banco
- [ ] Após cadastro, redireciona para `verificar-email` com o e-mail correto
- [ ] `npx jest` passa com os 5 testes unitários de cadastro
- [ ] `npx playwright test` passa com os 4 testes E2E de cadastro
- [ ] Sprint 1 continua passando (sem regressão)

---

## Sprint 3 — Perfil: Carregar e Atualizar Dados do Servidor

**Duração sugerida:** 1 semana
**Objetivo:** substituir os dados locais do perfil por dados reais vindos do back-end.

### Contexto

Hoje `perfil.tsx` e `editar-perfil.tsx` usam apenas dados salvos localmente no `auth-context`.
O back-end tem `GET /api/v1/usuarios/{id}` e `PUT /api/v1/usuarios/{id}` prontos.

### Contrato da API

**Buscar perfil:**
```
GET /api/v1/usuarios/{id}
Authorization: Bearer <token>
```
Resposta: `{ id, nome, email, tipoUsuario, ativo }`

**Atualizar perfil:**
```json
PUT /api/v1/usuarios/{id}
Authorization: Bearer <token>

{ "nome": "Ana Silva", "fotoUrl": "https://..." }
```

> **Atenção:** o back-end só aceita `nome` e `fotoUrl` no PUT.
> E-mail, senha e tipo de usuário não podem ser alterados por este endpoint.

### 3.1 — Criar hook `useUsuario`

> **O que é um hook?** É uma função que começa com `use` e encapsula lógica reutilizável.
> Em vez de repetir o código de buscar o usuário em várias telas, criamos um hook.

Criar `hooks/useUsuario.ts`:

```typescript
// hooks/useUsuario.ts
// Hook responsável por buscar e atualizar dados do usuário no servidor.
// Separa a lógica de dados da lógica de exibição (princípio da responsabilidade única).

import { useState, useEffect } from 'react';
import { authFetch } from '@/utils/api';

export function useUsuario(id: number | null) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    // Não busca se não tiver ID
    if (!id) return;

    setCarregando(true);
    // authFetch adiciona o token JWT automaticamente
    authFetch(`/usuarios/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar perfil');
        return res.json();
      })
      .then(setDados)
      .catch(e => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [id]);

  return { dados, carregando, erro };
}
```

### 3.2 — Atualizar `editar-perfil.tsx`

O que muda:
- Função `salvar` chama `PUT /api/v1/usuarios/{id}` além de atualizar o contexto local
- Trata erro de rede com alerta

### 3.3 — Excluir conta em `configuracoes.tsx`

O que muda:
- `confirmarExcluir` chama `DELETE /api/v1/usuarios/{id}` antes de limpar o storage local

### 3.4 — Testes Unitários

Criar `__tests__/useUsuario.test.ts` com os cenários:

| Cenário | Simulação | Resultado esperado |
|---------|-----------|-------------------|
| Busca bem-sucedida | 200 com dados | `dados` preenchido |
| Erro de autenticação | 401 | `erro` preenchido |
| Sem conexão | fetch lança TypeError | `erro` preenchido |

### 3.5 — Testes E2E

Criar `e2e/perfil.spec.ts` com os cenários:

| Cenário | Ação | Verificação |
|---------|------|-------------|
| Ver perfil | navega para perfil logado | nome do usuário aparece |
| Editar nome | altera nome e salva | novo nome aparece no perfil |
| Excluir conta | confirma exclusão | redireciona para login |

### Critério de aceite da Sprint 3
- [ ] Perfil exibe dados reais do banco
- [ ] Edição de nome e foto persiste no servidor
- [ ] Exclusão de conta remove do banco e desloga
- [ ] `npx jest` passa com os 3 testes do hook
- [ ] `npx playwright test` passa com os 3 testes E2E de perfil
- [ ] Sprints anteriores continuam passando

---

## Sprint 4 — Biblioteca: Trilhas e Aulas do Servidor

**Duração sugerida:** 1 semana
**Objetivo:** substituir o `fetch` hardcoded em `biblioteca.tsx` pela chamada real ao back-end.

### Contexto

`biblioteca.tsx` já tem a estrutura de busca, mas aponta para `http://SEU_BACKEND/api/materiais`
que não existe. O back-end tem `GET /api/v1/trilhas` que retorna as trilhas de estudo.

### Contrato da API

```
GET /api/v1/trilhas
Authorization: Bearer <token>
```

Resposta (array):
```json
[
  { "id": 1, "titulo": "Matemática Básica", "descricao": "...", "visibilidade": "PUBLICA" },
  { "id": 2, "titulo": "Português", "descricao": "...", "visibilidade": "PUBLICA" }
]
```

### 4.1 — Criar hook `useTrilhas`

Criar `hooks/useTrilhas.ts`:

```typescript
// hooks/useTrilhas.ts
// Busca a lista de trilhas disponíveis no servidor.
// Separa a lógica de dados da tela (biblioteca.tsx fica mais limpa).

import { useState, useEffect } from 'react';
import { authFetch } from '@/utils/api';

export type Trilha = {
  id: number;
  titulo: string;
  descricao: string;
  visibilidade: 'PUBLICA' | 'PRIVADA';
};

export function useTrilhas() {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    authFetch('/trilhas')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar trilhas');
        return res.json();
      })
      .then(setTrilhas)
      .catch(e => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  return { trilhas, carregando, erro };
}
```

### 4.2 — Atualizar `biblioteca.tsx`

O que muda:
- Remove o `fetch` hardcoded
- Usa o hook `useTrilhas`
- Mapeia `Trilha` para o tipo `Material` já existente na tela

### 4.3 — Testes Unitários

Criar `__tests__/useTrilhas.test.ts`:

| Cenário | Simulação | Resultado esperado |
|---------|-----------|-------------------|
| Lista carregada | 200 com array | `trilhas` preenchido |
| Lista vazia | 200 com `[]` | `trilhas` vazio, sem erro |
| Erro de autenticação | 401 | `erro` preenchido |

### 4.4 — Testes E2E

Criar `e2e/biblioteca.spec.ts`:

| Cenário | Ação | Verificação |
|---------|------|-------------|
| Ver trilhas | navega para biblioteca logado | lista de trilhas aparece |
| Buscar trilha | digita nome na busca | filtra corretamente |
| Sem conexão | servidor offline | mensagem de erro amigável |

### Critério de aceite da Sprint 4
- [ ] Biblioteca exibe trilhas reais do banco
- [ ] Busca e filtros funcionam com dados reais
- [ ] `npx jest` passa com os 3 testes do hook
- [ ] `npx playwright test` passa com os 3 testes E2E
- [ ] Sprints anteriores continuam passando

---

## Sprint 5 — Home: Progresso Real do Aluno

**Duração sugerida:** 1 semana
**Objetivo:** exibir na tela inicial o progresso real do aluno vindo do back-end.

### Contexto

`index.tsx` calcula a meta da semana com base no XP local (`user.xp`).
O back-end tem `GET /api/v1/progresso/aluno/{id}` que retorna as aulas concluídas com datas.

### Contrato da API

```
GET /api/v1/progresso/aluno/{alunoId}
Authorization: Bearer <token>
```

Resposta:
```json
[
  { "aulaId": 1, "concluidaEm": "2025-01-15T10:30:00" },
  { "aulaId": 2, "concluidaEm": "2025-01-16T14:00:00" }
]
```

### 5.1 — Criar hook `useProgressoSemanal`

Criar `hooks/useProgressoSemanal.ts`:

```typescript
// hooks/useProgressoSemanal.ts
// Calcula quantas aulas o aluno concluiu na semana atual.
// Usa os dados reais do servidor em vez do XP local.

import { useState, useEffect } from 'react';
import { authFetch } from '@/utils/api';

export function useProgressoSemanal(alunoId: number | null) {
  const [aulasSemana, setAulasSemana] = useState(0);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!alunoId) return;

    setCarregando(true);
    authFetch(`/progresso/aluno/${alunoId}`)
      .then(res => res.ok ? res.json() : [])
      .then((lista: { aulaId: number; concluidaEm: string }[]) => {
        // Filtra apenas as aulas concluídas nos últimos 7 dias
        const seteDiasAtras = new Date();
        seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

        const naSemana = lista.filter(item =>
          new Date(item.concluidaEm) >= seteDiasAtras
        );
        setAulasSemana(naSemana.length);
      })
      .finally(() => setCarregando(false));
  }, [alunoId]);

  return { aulasSemana, carregando };
}
```

### 5.2 — Atualizar `index.tsx`

O que muda:
- Usa `useProgressoSemanal` para calcular o percentual da meta
- Mantém o layout exatamente igual — só a fonte dos dados muda

### 5.3 — Testes Unitários

Criar `__tests__/useProgressoSemanal.test.ts`:

| Cenário | Simulação | Resultado esperado |
|---------|-----------|-------------------|
| 3 aulas esta semana | 200 com 3 itens recentes | `aulasSemana === 3` |
| Aulas antigas | 200 com itens de meses atrás | `aulasSemana === 0` |
| Sem alunoId | — | não chama fetch |

### 5.4 — Testes E2E

Criar `e2e/home.spec.ts`:

| Cenário | Ação | Verificação |
|---------|------|-------------|
| Ver progresso | navega para home logado | barra de progresso aparece |
| Progresso zerado | aluno sem aulas | barra em 0% |

### Critério de aceite da Sprint 5
- [ ] Home exibe progresso real do banco
- [ ] Percentual calculado corretamente com base nos últimos 7 dias
- [ ] `npx jest` passa com os 3 testes do hook
- [ ] `npx playwright test` passa com os 2 testes E2E
- [ ] Sprints anteriores continuam passando

---

## Sprint 6 — Ranking: Integração e Persistência de Metas

**Duração sugerida:** 1 semana
**Objetivo:** conectar o ranking ao back-end e persistir metas no servidor.

### Contexto

`ranking.tsx` tem dois problemas:
1. O ranking aponta para `http://SEU_BACKEND/api/ranking` que não existe no back-end
2. As metas são salvas apenas em memória (somem ao fechar o app)

### 6.1 — Ranking: o que fazer no back-end

O back-end não tem rota de ranking ainda. Duas opções:

**Opção A (recomendada para trainee):** criar endpoint simples no back-end
```
GET /api/v1/usuarios/ranking?periodo=semanal
```
Retorna usuários ordenados por XP.

**Opção B:** calcular ranking no front-end com dados de progresso já existentes.

> Sugestão: implementar a Opção B primeiro (mais rápido) e evoluir para A depois.

### 6.2 — Metas: persistência local com AsyncStorage

Enquanto o back-end não tem endpoint de metas, persistir localmente:

```typescript
// Salva metas no SecureStore para não perder ao fechar o app
const METAS_KEY = 'studyconnect_metas';

// Ao carregar a tela, busca metas salvas
useEffect(() => {
  getItem(METAS_KEY).then(saved => {
    if (saved) setMetas(JSON.parse(saved));
  });
}, []);

// Ao salvar nova meta, persiste no storage
function salvarMeta() {
  const novasMetas = [...metas, novaMeta];
  setMetas(novasMetas);
  setItem(METAS_KEY, JSON.stringify(novasMetas));
}
```

### 6.3 — Testes Unitários

Criar `__tests__/metas.test.ts`:

| Cenário | Resultado esperado |
|---------|-------------------|
| Adicionar meta | lista aumenta em 1 |
| Concluir meta | `concluida` vira `true` |
| Reiniciar ciclo | todas as metas voltam para `false` |

### 6.4 — Testes E2E

Criar `e2e/ranking.spec.ts`:

| Cenário | Ação | Verificação |
|---------|------|-------------|
| Ver metas | navega para ranking > metas | lista de metas aparece |
| Criar meta | preenche e salva | meta aparece na lista |
| Concluir meta | toca no checkbox | meta marcada como concluída |

### Critério de aceite da Sprint 6
- [ ] Metas persistem ao fechar e reabrir o app
- [ ] Ranking exibe dados (mesmo que calculados localmente)
- [ ] `npx jest` passa com os 3 testes de metas
- [ ] `npx playwright test` passa com os 3 testes E2E
- [ ] Sprints anteriores continuam passando

---

## Resumo Visual das Sprints

```
Sprint 0  ✅  Fundação: ambiente, api.ts centralizado, Playwright, Jest
Sprint 1  ✅  Login: integração real + 5 testes unitários + 4 testes E2E
Sprint 2  🔲  Cadastro: integração real + 5 testes unitários + 4 testes E2E
Sprint 3  🔲  Perfil: buscar/atualizar/excluir + 3 testes unitários + 3 E2E
Sprint 4  🔲  Biblioteca: trilhas reais + 3 testes unitários + 3 E2E
Sprint 5  🔲  Home: progresso real + 3 testes unitários + 2 E2E
Sprint 6  🔲  Ranking/Metas: persistência + 3 testes unitários + 3 E2E
```

**Total ao final:** ~25 testes unitários + ~22 testes E2E cobrindo todas as telas.

---

## Como Rodar os Testes

```bash
# Testes unitários (Jest) — rápidos, sem servidor
npx jest

# Testes unitários com cobertura de código
npx jest --coverage

# Testes E2E (Playwright) — precisa do app e do servidor rodando
npx expo start --web          # terminal 1: inicia o app web
npx playwright test           # terminal 2: roda os testes E2E

# Rodar apenas um arquivo de teste
npx jest __tests__/auth-login.test.ts
npx playwright test e2e/login.spec.ts
```

---

## Checklist Antes de Cada Commit

- [ ] `npx jest` passa sem erros
- [ ] O código novo tem comentários explicando o "porquê"
- [ ] Nomes de variáveis e funções estão em português e fazem sentido
- [ ] Não há `console.log` de debug esquecido
- [ ] Nenhuma tela existente foi quebrada
- [ ] A documentação foi atualizada se necessário

---

## Glossário

| Termo | Significado simples |
|-------|-------------------|
| **JWT** | Token de segurança gerado após o login. Prova que você está autenticado. |
| **SecureStore** | Cofre do celular onde o app guarda dados sensíveis (como o JWT). |
| **CORS** | Permissão que o servidor dá para o app acessá-lo de outro endereço. |
| **Mock** | Dado ou função falsa usada nos testes para simular o comportamento real. |
| **Hook** | Função React que começa com `use` e encapsula lógica reutilizável. |
| **DTO** | Objeto que carrega dados entre front-end e back-end. |
| **authFetch** | Nossa função que faz requisições HTTP já com o token JWT incluído. |
| **E2E** | Teste que simula um usuário real usando o sistema do início ao fim. |
| **Sprint** | Período curto de trabalho com entrega definida (geralmente 1 semana). |
| **TDD** | Escrever o teste antes do código. Ajuda a pensar no comportamento esperado. |
| **SOLID** | Conjunto de boas práticas para código organizado e fácil de manter. |
| **10.0.2.2** | Endereço especial do emulador Android que aponta para o localhost da sua máquina. |
