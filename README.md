# Documentação do Firebase — Arquitetura de Convites e Compartilhamento de Workspace

Esta documentação descreve a estrutura de coleções no **Firebase Firestore**, campos, relacionamentos, regras de segurança e o fluxo completo do sistema de convites e compartilhamento para ambientes financeiros multiproprietários/sócios.

---

## 1. Estrutura de Coleções e Documentos no Firestore

### A. Coleção `invites` (Convites do Sistema)
Caminho: `invites/{inviteId}`

Contém os registros de convites gerados pelos proprietários dos workspaces.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `string` | Identificador único do documento do convite. |
| `coupleId` | `string` | ID do workspace (`couples/{coupleId}`) associado. |
| `coupleName` | `string` | Nome do espaço financeiro no momento do convite. |
| `ownerUid` | `string` | Firebase Auth UID do proprietário/criador do convite. |
| `ownerName` | `string` | Nome do proprietário/criador. |
| `token` | `string` | Token de segurança único e não imprevisível (ex: `inv_8f92...`). |
| `code` | `string` | Código de 4 dígitos para entrada manual (ex: `4729`). |
| `status` | `string` | Enum: `'PENDENTE'` \| `'ACEITO'` \| `'EXPIRADO'` \| `'CANCELADO'`. |
| `createdAt` | `string` | Timestamp ISO da criação. |
| `expiresAt` | `string` | Timestamp ISO de expiração (24 horas após a criação). |
| `acceptedByUid` | `string?` | Firebase Auth UID do sócio que aceitou o convite. |
| `acceptedByName` | `string?` | Nome do sócio que aceitou o convite. |
| `acceptedAt` | `string?` | Timestamp ISO do aceite. |

---

### B. Coleção `couples` (Workspaces Compartilhados)
Caminho: `couples/{coupleId}`

Contém os dados centrais do ambiente financeiro compartilhado.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `partner1` | `string` | UID do Proprietário. |
| `partner2` | `string?` | UID do segundo Sócio (preenchido após aceitar convite). |
| `partner2Name` | `string?` | Nome do segundo Sócio. |
| `type` | `string` | Enum: `'Personal'` \| `'Business'`. |
| `name` | `string` | Nome do Espaço (ex: "Finanças Empresariais"). |
| `createdAt` | `string` | Data de criação. |

---

### C. Coleção `users` (Perfis de Usuário)
Caminho: `users/{userId}`

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `uid` | `string` | Firebase Auth UID do usuário. |
| `email` | `string` | E-mail da conta Google. |
| `displayName` | `string` | Nome do usuário. |
| `currentCoupleId` | `string?` | ID do workspace atualmente selecionado. |
| `workspaceIds` | `array` | Lista de IDs dos workspaces a que o usuário pertence. |
| `role` | `string?` | Função (`'partner1'` ou `'partner2'`). |

---

## 2. Fluxo de Operação e Segurança

1. **Geração de Convite (`COMPARTILHAR`)**:
   - O Proprietário gera um novo documento em `invites` com `status: 'PENDENTE'`, um `token` único e um `code` de 4 dígitos.
   - O link gerado para o compartilhamento nativo (WhatsApp, Telegram, etc.) segue o padrão:  
     `https://dominio.com/?invite=inv_8f92a104...`

2. **Recepção do Link pelo Sócio**:
   - Ao clicar no link, a aplicação abre e lê o parâmetro `invite` da URL.
   - O documento do convite é consultado no Firestore.
   - O sistema valida se `status == 'PENDENTE'` e se `expiresAt > Date.now()`.
   - Se o sócio não estiver logado, realiza a autenticação pelo **Firebase Auth** (Google) e, na sequência, aceita o convite automaticamente.

3. **Entrada Manual por Código de 4 Dígitos**:
   - Caso o sócio utilize o formulário de 4 dígitos, a aplicação realiza a busca por `code == '4729'` e `status == 'PENDENTE'`.
   - A autorização final aos dados depende estritamente do **Firebase Auth** e das **Regras do Firestore**, e não apenas da posse dos 4 dígitos.

4. **Sincronização entre Sócios**:
   - Após o aceite, o `partner2` é registrado em `couples/{coupleId}`.
   - As consultas em tempo real (`onSnapshot`) escutam as subcoleções (`transactions`, `clients`, `debts`, `accounts`, `investments`, etc.) sob o id do workspace `couples/{coupleId}`, garantindo sincronia imediata entre os dois integrantes.

---

## 3. Regras de Segurança no Firestore (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function getCouple(coupleId) {
      return get(/databases/$(database)/documents/couples/$(coupleId)).data;
    }

    function isMemberOfCouple(coupleId) {
      let couple = getCouple(coupleId);
      return isSignedIn() && (couple.partner1 == request.auth.uid || couple.partner2 == request.auth.uid);
    }

    // Regras da Coleção de Convites
    match /invites/{inviteId} {
      allow read: if true; // Permite consultar token/código de convite para validação
      allow create: if isSignedIn();
      allow update: if isSignedIn();
    }

    // Regras de Workspaces Compartilhados
    match /couples/{coupleId} {
      allow get, list, create, update: if isSignedIn();
    }

    // Regras das Subcoleções (Transações, Clientes, Dívidas, Contas, Investimentos)
    match /couples/{coupleId}/{collectionId}/{docId} {
      allow list, get, create, update, delete: if isMemberOfCouple(coupleId);
    }
  }
}
```
