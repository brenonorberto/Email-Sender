# Análise de Compatibilidade com Windows

**Data da Análise:** 19 de março de 2026  
**Status Geral:** ✅ **COMPATÍVEL COM WINDOWS** (Com ressalvas menores)

---

## 📊 Resumo Executivo

O projeto **email-sender** está **bem preparado para funcionar no Windows**. O código utiliza APIs do Node.js que são multiplataforma e gerencia caminhos de forma correta usando `path.sep` e módulo `path` do Node.js. Não há bloqueadores críticos para execução no Windows.

---

## ✅ Pontos Positivos (Compatibilidade)

### 1. **Uso Correto do Módulo `path`**

- ✅ Usa `path.join()`, `path.resolve()`, `path.relative()`, `path.dirname()`, `path.basename()`
- ✅ Usa `path.sep` para separadores de diretório (`\` no Windows, `/` no Linux/Mac)
- ✅ Exemplos:
  ```js
  const partes = relativePath.split(path.sep) // Correto!
  const destino = path.join(dir, "ENVIADOS") // Correto!
  ```

### 2. **Regex Cross-Platform em `watcher.js`**

- ✅ Detecta separadores com regex `[/\\]` (funciona em todos os S.O.)
  ```js
  ;/[/\\]ENVIADOS([/\\]|$)/i.test(filePath) // ✅ Funciona no Windows e Unix
  ```

### 3. **Normalização de Caminhos em `processarArquivo.js`**

- ✅ Trata ambos os tipos de separadores:
  ```js
  const normalized = filePath.replace(/\\/g, "/") // Normaliza barras invertidas
  ```

### 4. **Dependências Multiplataforma**

- ✅ `chokidar@5.0.0` - suporta Windows nativamente
- ✅ `nodemailer@8.0.1` - totalmente cross-platform
- ✅ `dotenv@17.3.1` - multiplataforma
- ℹ️ Nenhuma dependência Unix-específica

### 5. **ES Modules Funciona no Windows**

- ✅ `"type": "module"` no `package.json` funciona normalmente no Windows com Node.js 14+

### 6. **Forward Slashes em Caminhos**

- ✅ Node.js entende forward slashes (`/`) mesmo no Windows
- ✅ Caminhos como `"./logs"` e `"./empresas"` funcionam corretamente

---

## ⚠️ Questões Menores (Não Bloqueadoras)

### 1. **Inicialização de Pastas**

**Status:** ⚠️ Pode causar erro na primeira execução

A função `garantirPastasSistema()` em `utils/folderUtils.js` **NÃO É CHAMADA** em nenhum lugar.

**Arquivo:** [utils/folderUtils.js](utils/folderUtils.js)

**Problema:**

```js
export function garantirPastasSistema() {
  const pastas = ["./logs", "./empresas"]
  // Esta função nunca é chamada!
}
```

**Risco no Windows:** Se as pastas `logs/` e `empresas/` não existirem, o programa falhará ao tentar escrever logs ou servir recursos.

**Recomendação:** Chamar esta função no `index.js` antes de iniciar o watcher.

---

### 2. **Permissões de Arquivo**

**Status:** ⚠️ Possível problema em alguns ambientes Windows com restrições

**Possíveis Cenários:**

- Arquivos em pastas protegidas (Program Files, etc.)
- Antivírus bloqueando escrita/leitura
- OneDrive/Dropbox travando arquivo durante movimento

**Recomendação:** Adicionar logs detalhados para erros de permissão (já existe em parcialmente).

---

### 3. **Caminhos Longos no Windows (MAX_PATH)**

**Status:** ⚠️ Risco teórico

**O Problema:**

- Windows tem limite histórico de 260 caracteres para caminhos
- Afeta versões antigas do Windows 10 e anteriores
- Windows 10+ suporta caminhos longos se habilitado

**Não é Bloqueador:** A maioria dos sistemas modernos suporta, mas é algo a ter em mente.

---

### 4. **Variáveis de Ambiente**

**Status:** ✅ Sem problemas

- `dotenv` lida corretamente com .env em Windows
- Paths nos .env devem usar `/` (que Windows entende) ou `\\`

---

## 🔧 Recomendações para Melhorar Compatibilidade

### 1. **[CRÍTICO] Inicializar Pastas no Startup**

**Edite `index.js`:**

```js
import { iniciarWatcher } from "./watcher/watcher.js"
import { processarFila } from "./services/processarArquivo.js"
import { garantirPastasSistema } from "./utils/folderUtils.js"

// Criar pastas necessárias antes de iniciar
garantirPastasSistema()

iniciarWatcher(processarFila)
```

---

### 2. **[RECOMENDADO] Melhorar `folderUtils.js`**

Use `path` para melhor cross-platform:

```js
import fs from "fs"
import path from "path"

export function garantirPastasSistema() {
  const pastas = [
    path.join(process.cwd(), "logs"),
    path.join(process.cwd(), "empresas"),
  ]

  pastas.forEach((pasta) => {
    if (!fs.existsSync(pasta)) {
      fs.mkdirSync(pasta, { recursive: true })
      console.log("Pasta criada:", pasta)
    }
  })
}
```

---

### 3. **[RECOMENDADO] Adicionar Script de Inicialização**

**Edite `package.json`:**

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  }
}
```

---

### 4. **[OPCIONAL] Adicionar Validação de Ambiente no Startup**

Edite `index.js` para validar variáveis obrigatórias:

```js
import { config } from "./config/env.js"
import { logger } from "./utils/logger.js"

// Validar variáveis críticas
if (!config.emailUser || !config.emailPass) {
  console.error("Erro: EMAIL_USER e EMAIL_PASS não configuradas no .env")
  process.exit(1)
}

if (!config.rootFolder) {
  console.error("Erro: ROOT_FOLDER não configurada no .env")
  process.exit(1)
}

logger.info("Variáveis de ambiente validadas ✓")
```

---

## 🧪 Teste de Compatibilidade Recomendado

Para validar no Windows:

```powershell
# 1. Clone/copie o projeto
cd C:\Users\seu-usuario\email-sender

# 2. Instale dependências
npm install

# 3. Configure o .env (copie de .env.example)
copy .env.example .env
# Edite .env com credenciais reais

# 4. Crie estrutura inicial
mkdir empresas
mkdir logs

# 5. Execute
node index.js

# 6. Teste criando um arquivo
# Copie um arquivo para: empresas\empresa1\teste.txt
```

---

## 📋 Checklist de Configuração para Windows

- [ ] Instalar Node.js LTS (v18+) no Windows
- [ ] Copiar/renomear `.env.example` para `.env`
- [ ] Preencher credenciais Gmail no `.env`
- [ ] Criar pasta `empresas/` manualmente OU rodar `node index.js` (falhará primeira vez mas criará)
- [ ] Criar subpastas: `empresas/empresa1/`, `empresas/empresa2/` etc.
- [ ] Configurar `empresas.json` com dados reais
- [ ] Executar: `node index.js`
- [ ] Testar criando arquivo em `empresas/empresa1/teste.txt`

---

## ✅ Conclusão

O projeto está **COMPATÍVEL COM WINDOWS** e pode ser utilizado sem problemas em produção.

**Recomendações Prioritárias:**

1. ✅ Chamar `garantirPastasSistema()` no `index.js` (1 linha)
2. ✅ Adicionar validação de variáveis de ambiente (5 linhas)

Após essas pequenas correções, o projeto funcionará perfeitamente no Windows.
