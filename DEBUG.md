# 🔍 Guia de Debug - Email Não Sendo Enviado

## Problema Relatado

- ✅ Log mostra "Email enviado com sucesso"
- ❌ Email não chega na caixa de entrada
- ❌ Arquivo não é movido para `ENVIADOS/`

---

## 🔧 Melhorias Implementadas

### 1. **Validação de Credenciais no Startup**

Agora o sistema valida `EMAIL_USER` e `EMAIL_PASS` antes de qualquer coisa.

### 2. **Teste de Conexão com Gmail**

Ao iniciar com `npm start`, o sistema testa a conexão com Gmail e mostra:

```
✅ Conexão com Gmail verificada com sucesso
```

ou

```
❌ Falha ao conectar com Gmail: Invalid credentials
```

### 3. **Logs Detalhados de Envio**

Cada tentativa agora mostra:

```
[Tentativa 1/3] Enviando email para brenonorberto@gmail.com...
✅ Email enviado com sucesso. Message ID: <xxx@gmail.com>
```

---

## 📱 Como Diagnosticar o Problema

### Passo 1: Verificar Credenciais Gmail

**A. Confirme que 2FA está habilitado:**

1. Acesse: https://myaccount.google.com/security
2. Procure por "2-Step Verification"
3. Se NOT está ativado, configure agora
4. Salve códigos de backup em lugar seguro

**B. Gere uma App Password:**

1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione: **Mail** e **Windows/Linux/Mac**
3. Google gerará 16 caracteres: `xxxx xxxx xxxx xxxx`
4. **Copie EXATAMENTE como mostrado** (com ou sem espaços)

### Passo 2: Configurar .env Corretamente

Edite `.env`:

```env
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

**⚠️ ATENÇÃ: Erros comuns:**

- ❌ Usar senha normal do Gmail (não funciona)
- ❌ Espaços faltando na App Password
- ❌ Copiar/colar incompleto
- ❌ Não ter 2FA habilitado

### Passo 3: Teste de Conexão

Execute o setup para verificar:

```bash
node setup.js
```

Você deve ver:

```
✅ Credenciais Gmail configuradas
```

### Passo 4: Testar Envio Completo

1. **Inicie a aplicação:**

   ```bash
   npm start
   ```

2. **Observe os logs iniciais:**

   ```
   ✅ Variáveis de ambiente validadas
   📁 Pasta monitorada: ./empresas
   🔐 Testando conexão com Gmail...
   ✅ Conexão com Gmail verificada com sucesso
   🎯 Iniciando sistema de monitoramento...
   ```

3. **Crie um arquivo de teste:**

   ```bash
   mkdir -p empresas/empresa2
   echo "teste" > empresas/empresa2/teste.pdf
   ```

4. **Monitore os logs em outro terminal:**

   ```bash
   tail -f logs/app.log

   # Você deve ver algo como:
   # Arquivo adicionado à fila: empresas/empresa2/teste.pdf
   # [Tentativa 1/3] Enviando email para brenonorberto@gmail.com...
   # ✅ Email enviado com sucesso. Message ID: <xxx@gmail.com>
   # Arquivo movido para ENVIADOS: empresas/empresa2/ENVIADOS/teste.pdf
   ```

---

## ❌ Erros Comuns e Soluções

### Erro: "Invalid credentials"

```
❌ Falha ao conectar com Gmail: Invalid credentials
```

**Solução:**

1. Verifique EMAIL_USER (está correto?)
2. Verifique EMAIL_PASS (é uma App Password, não senha normal)
3. Verifique 2FA no Gmail
4. Gere uma nova App Password e tente novamente

### Erro: "PLAIN AUTH not enabled"

```
❌ Falha ao conectar com Gmail: PLAIN AUTH not enabled
```

**Solução:**

1. O Gmail pode estar bloqueando
2. Habilitare "Allow less secure apps" se for conta pessoal
3. Use App Password (melhor segurança)

### Erro: "530 5.7.0 Authentication required"

```
❌ Falha ao conectar com Gmail: Authentication required
```

**Solução:**

- As credenciais estão vazias ou inválidas
- Verifique arquivo `.env`
- Confirme que `.env` foi salvo

### Email aparece como "From: seu-email@gmail.com" mas não chega

**Possíveis causas:**

1. ✅ Agora com os novos logs você verá exatamente se falhou
2. Gmail bloqueou como spam
3. Servidor SMTP rejeitou

---

## 🧪 Teste Completo Passo-a-Passo

```bash
# 1. Limpe arquivos de teste anteriores
rm -rf empresas/empresa2/teste.pdf
rm -rf empresas/empresa2/ENVIADOS/*

# 2. Inicie a aplicação
npm start

# Em outro terminal:
# 3. Monitorar logs em tempo real
tail -f logs/app.log

# Em outro terminal:
# 4. Criar arquivo de teste
sleep 5 && echo "Arquivo de teste" > empresas/empresa2/teste-debug.pdf

# Você deve ver nos logs:
# 1. Arquivo agora na fila
# 2. Tentativa de envio com detalhes
# 3. Sucesso ou erro claro
# 4. Arquivo movido ou não
```

---

## 📊 Fluxo Esperado (Com Sucesso)

```
1. npm start
   ↓
2. Testa conexão com Gmail ✅
   ↓
3. Inicia watcher
   ↓
4. Arquivo criado em empresas/empresa2/
   ↓
5. [Tentativa 1/3] Enviando email...
   ↓
6. ✅ Email enviado com sucesso. Message ID: <id>
   ↓
7. Arquivo movido para ENVIADOS/
   ↓
8. ✅ Pronto!
```

---

## 📚 Arquivos de Log

### Verificar logs depois:

```bash
# Logs gerais
cat logs/app.log

# Apenas erros
cat logs/error.log

# Últimas linhas em tempo real
tail -f logs/app.log
tail -f logs/error.log
```

---

## 🆘 Se Ainda Não Funcionar

1. **Verifique os logs detalhados:**

   ```bash
   cat logs/error.log
   ```

2. **Confirme cada passo:**
   - [ ] NODE.js 16+ instalado
   - [ ] npm install executado
   - [ ] .env existe e tem credenciais
   - [ ] EMAIL_USER é um Gmail real
   - [ ] EMAIL_PASS é uma App Password (16 caracteres)
   - [ ] 2FA habilitado no Gmail
   - [ ] Pasta empresas/empresa2/ existe

3. **Teste manualmente com curl (Linux/Mac):**
   ```bash
   curl --url 'smtp://smtp.gmail.com:587' \
     --ssl-reqd \
     --mail-from '<seu-email@gmail.com>' \
     --mail-rcpt '<destino@gmail.com>' \
     --user '<seu-email@gmail.com>:<app-password>' \
     -T <(echo -e "To: destino@gmail.com\nSubject: Teste\n\nCorpo")
   ```

---

## 💡 Próximas Ações

1. **Execute `npm start` e observe logs iniciais**
2. **Se houver erro de conexão, ajuste credenciais**
3. **Se conectar OK, crie arquivo de teste**
4. **Acompanhe os logs em tempo real**

Os novos logs mostrarão **exatamente** o que está acontecendo! 🎯

---

**Versão:** 1.0.0  
**Data:** 19 de março de 2026
