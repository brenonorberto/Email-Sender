# Guia de Instalação Cross-Platform

> Instruções para instalar e configurar o **Email Sender** em Windows, macOS e Linux

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js 16+** (recomendado 18+)
- **npm** (incluído com Node.js)
- **Conta Gmail** com 2FA habilitado (para gerar App Password)

### 1️⃣ Instalação Básica

```bash
# Clonar/copiar projeto
cd email-sender

# Instalar dependências
npm install

# Executar setup inicial
node setup.js
```

---

## 🪟 Instalação no Windows

### Passo a Passo

1. **Baixar Node.js**
   - Acesse: https://nodejs.org/
   - Download: Versão LTS (Recomendado 18+)
   - Instale mantendo as opções padrão

2. **Verificar instalação**

   ```powershell
   node --version
   npm --version
   ```

3. **Copiar projeto**

   ```powershell
   # Copie a pasta do projeto para um local seguro
   # Exemplo: C:\Users\seu-usuario\Projetos\email-sender
   cd C:\Users\seu-usuario\Projetos\email-sender
   ```

4. **Instalar dependências**

   ```powershell
   npm install
   ```

5. **Setup inicial**

   ```powershell
   # Cria pastas e verifica configuração
   node setup.js
   ```

6. **Configurar arquivo .env**

   ```powershell
   # Abra .env com seu editor favorito
   notepad .env

   # Configure:
   # EMAIL_USER=seu-email@gmail.com
   # EMAIL_PASS=seu-app-password-de-16-caracteres
   # ROOT_FOLDER=./empresas
   ```

7. **Iniciar aplicação**
   ```powershell
   npm start
   ```

### Dica Windows: Criar Atalho

Para facilitar, crie um arquivo `iniciar.bat` na pasta principal:

```batch
@echo off
cd /d "%~dp0"
npm start
pause
```

Clique duas vezes neste arquivo para iniciar.

---

## 🍎 Instalação no macOS

### Passo a Passo

1. **Instalar Node.js com Homebrew**

   ```bash
   # Se não possui Homebrew
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

   # Instalar Node.js
   brew install node
   ```

   Ou baixe direto de: https://nodejs.org/

2. **Verificar instalação**

   ```bash
   node --version
   npm --version
   ```

3. **Clonar/copiar projeto**

   ```bash
   cd ~/Projetos/email-sender
   ```

4. **Instalar dependências**

   ```bash
   npm install
   ```

5. **Setup inicial**

   ```bash
   node setup.js
   ```

6. **Configurar arquivo .env**

   ```bash
   # Editar .env com seu editor favorito
   nano .env
   # ou
   code .env
   ```

7. **Iniciar aplicação**
   ```bash
   npm start
   ```

---

## 🐧 Instalação no Linux

### Debian/Ubuntu

```bash
# Atualizar pacotes
sudo apt update

# Instalar Node.js
sudo apt install nodejs npm

# Verificar
node --version
npm --version
```

### CentOS/RedHat

```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### Iniciar Projeto

```bash
cd ~/Projetos/email-sender
npm install
node setup.js
nano .env  # Configurar credenciais
npm start
```

---

## ⚙️ Configuração Detalhada

### Arquivo `.env`

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
# --- Credenciais Gmail ---
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# --- Configuração ---
SMTP_SERVICE=gmail
ROOT_FOLDER=./empresas
SEND_INTERVAL=600000
MAX_RETRIES=3

# --- Assinatura (opcional) ---
SIGNATURE_IMAGE_PATH=./config/assinatura.png
SIGNATURE_TEXT="Atenciosamente,\nSeu Nome"
```

### Gerar App Password (Gmail)

1. Acesse: https://myaccount.google.com/security
2. Ative **2-Step Verification** (2FA)
3. Vá para: https://myaccount.google.com/apppasswords
4. Selecione: Mail > Windows/Linux/Mac
5. Google gerará uma senha de 16 caracteres
6. **Cole em `EMAIL_PASS=`** no `.env`

### Estrutura de Pastas

```
email-sender/
├── empresas/              (criada automaticamente ou pelo setup)
│   ├── empresa1/
│   │   └── ENVIADOS/     (criada ao enviar arquivo)
│   ├── empresa2/
│   └── ERRO/             (arquivos com falha)
├── logs/                  (criada automaticamente)
├── data/
│   └── empresas.json     (configure aqui)
└── .env                  (configure aqui)
```

#### Configurar `data/empresas.json`:

```json
[
  {
    "nome": "empresa1",
    "emails": ["email1@empresa.com", "email2@empresa.com"]
  },
  {
    "nome": "empresa2",
    "emails": ["contato@empresa2.com"]
  }
]
```

---

## ▶️ Executar a Aplicação

### Comando Normal

```bash
npm start
```

### Modo Desenvolvimento (com Auto-reload)

```bash
npm run dev
```

### Primeira Execução

Na primeira execução:

1. ✅ Pastas `logs/` e `empresas/` são criadas automaticamente
2. ✅ Variáveis de ambiente são validadas
3. ✅ Watcher inicia a monitorar arquivos
4. ✅ Fila começa a processar

---

## 🧪 Testar a Configuração

1. **Criar pasta de empresa**

   ```bash
   mkdir empresas/empresa1
   mkdir empresas/empresa2
   ```

2. **Criar arquivo de teste**

   ```bash
   echo "teste" > empresas/empresa1/documento.txt
   ```

3. **Observar logs**
   ```bash
   # Em outro terminal
   tail -f logs/app.log    # macOS/Linux
   type logs\app.log       # Windows (ou abra com editor)
   ```

---

## 🐛 Troubleshooting

### Erro: "node: command not found"

**Solução:** Node.js não está instalado. Instale de: https://nodejs.org/

### Erro: "ENOENT: no such file or directory '.env'"

**Solução:** Copie `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

### Erro: "EMAIL_USER e EMAIL_PASS não configuradas"

**Solução:** Abra `.env` e preencha as credenciais Gmail

### Erro: "Pasta não tem permissão"

**Solução (Windows):**

- Execute PowerShell como Administrador
- Ou coloque o projeto fora de `Program Files/`

**Solução (Linux/Mac):**

```bash
sudo chown -R $USER:$USER .
```

### Arquivos não são detectados

**Verifique:**

1. Arquivo está em `empresas/empresa-name/` (não em subpastas)
2. Não está em pasta `ENVIADOS/` ou `ERRO/`
3. Pasta não está em lista de ignorar (`.gitignore`)
4. Watcher está rodando (verifique logs)

### Rate limit (Gmail limite diário)

**Por padrão:** 450 emails/dia
**Configurar novo limite:**

```env
GMAIL_DAILY_LIMIT=500
```

---

## 📚 Scripts Disponíveis

```bash
npm start           # Executar aplicação
npm run dev         # Modo desenvolvimento com hot-reload
npm run setup       # Executar verificações iniciais
npm test            # (não implementado)
```

---

## ✅ Checklist de Setup

- [ ] Node.js 16+ instalado
- [ ] npm install executado
- [ ] node setup.js passou sem erros
- [ ] `.env` configurado com credenciais Gmail
- [ ] `data/empresas.json` com empresas reais
- [ ] Pastas `empresas/empresa1/`, `empresas/empresa2/` criadas
- [ ] npm start iniciou sem erros
- [ ] Arquivo de teste movido para ENVIADOS/ com sucesso

---

## 💡 Dicas

### Modo contínuo em Background

**Windows (PowerShell admin):**

```powershell
Start-Process powershell -WindowStyle Hidden -ArgumentList "-Command","Set-Location '$PWD';npm start"
```

**Linux/Mac:**

```bash
nohup npm start > logs/app.log 2>&1 &
```

### Logs em Tempo Real

```bash
# Linux/Mac
tail -f logs/app.log
tail -f logs/error.log

# Windows PowerShell
Get-Content logs/app.log -Wait
```

### Reiniciar Aplicação

Pressione `Ctrl+C` para parar e execute `npm start` novamente.

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique `logs/app.log` e `logs/error.log`
2. Confirme que todas as variáveis do `.env` estão preenchidas
3. Teste com `node setup.js`
4. Verifique permissões de pasta

---

**Versão:** 1.0.0  
**Data:** 19 de março de 2026  
**Compatibilidade:** Windows, macOS, Linux
