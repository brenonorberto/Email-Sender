# Email Sender

Um sistema automatizado para envio de emails baseado em arquivos. O projeto monitora uma pasta específica e, quando novos arquivos são adicionados em subpastas de empresas, envia-os por email para os destinatários configurados.

## Funcionalidades

- **Monitoramento automático**: Usa `chokidar` para detectar novos arquivos em tempo real
- **Envio de emails**: Integração com `nodemailer` para envio de emails com anexos
- **Configuração por empresa**: Cada empresa tem seus próprios emails destinatários
- **Rate limiting**: Controle de frequência de envio para evitar spam
- **Retry automático**: Tentativas de reenvio em caso de falha
- **Logging**: Sistema de logs detalhado com rotação automática
- **Gestão de arquivos**: Movimentação automática para pastas ENVIADOS ou ERRO

## Estrutura do Projeto

```
email-sender/
├── index.js                 # Ponto de entrada da aplicação
├── package.json             # Dependências e scripts
├── config/
│   ├── email.js            # Configuração do transporte de email
│   └── env.js              # Carregamento de variáveis de ambiente
├── data/
│   └── empresas.json       # Configuração das empresas e emails
├── empresas/               # Pasta raiz monitorada
│   ├── empresa1/
│   │   └── ENVIADOS/      # Arquivos enviados com sucesso
│   └── empresa2/
│       └── ENVIADOS/
├── logs/                   # Arquivos de log
├── services/
│   ├── emailService.js     # Lógica de envio de emails
│   └── processarArquivo.js # Processamento de arquivos
├── utils/
│   ├── fileUtils.js        # Utilitários para manipulação de arquivos
│   ├── folderUtils.js      # Utilitários para pastas
│   ├── logger.js           # Sistema de logging
│   └── rateLimiter.js      # Controle de taxa de envio
└── watcher/
    └── watcher.js          # Monitoramento de arquivos
```

## Instalação

1. Clone o repositório:

   ```bash
   git clone <url-do-repositorio>
   cd email-sender
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente criando um arquivo `.env`:
   ```env
   EMAIL_USER=seu-email@gmail.com
   EMAIL_PASS=sua-senha-de-app
   SMTP_SERVICE=gmail
   ROOT_FOLDER=./empresas
   SEND_INTERVAL=600000
   MAX_RETRIES=3
   LOG_MAX_SIZE_MB=10
   SIGNATURE_TEXT=Assinatura opcional
   SIGNATURE_IMAGE_PATH=caminho/para/imagem.png
   ```

## Configuração

### Empresas

Edite o arquivo `data/empresas.json` para adicionar ou modificar empresas:

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

### Estrutura de Pastas

Crie a estrutura de pastas conforme necessário:

- `empresas/empresa1/` - Arquivos para empresa1
- `empresas/empresa2/` - Arquivos para empresa2
- Cada empresa deve ter uma pasta `ENVIADOS/` criada automaticamente

## Uso

Execute o sistema:

```bash
node index.js
```

O sistema irá:

1. Monitorar a pasta configurada em `ROOT_FOLDER`
2. Detectar novos arquivos adicionados
3. Identificar a empresa baseada na subpasta
4. Enviar o arquivo por email para os destinatários configurados
5. Mover o arquivo para a pasta `ENVIADOS/` em caso de sucesso

## Funcionamento

1. **Monitoramento**: O `watcher.js` usa chokidar para monitorar mudanças na pasta raiz
2. **Fila**: Arquivos são adicionados a uma fila por empresa
3. **Processamento**: `processarArquivo.js` processa a fila periodicamente
4. **Envio**: `emailService.js` envia emails com anexos usando nodemailer
5. **Gestão**: Arquivos são movidos para pastas apropriadas após processamento

## Logs

Os logs são salvos em:

- `logs/app.log`: Logs gerais da aplicação
- `logs/error.log`: Logs de erro

Os logs são rotacionados automaticamente quando atingem o tamanho máximo configurado.

## Dependências

- `chokidar`: Monitoramento de arquivos
- `nodemailer`: Envio de emails
- `dotenv`: Carregamento de variáveis de ambiente

## Desenvolvimento

O projeto usa ES modules (`"type": "module"` no package.json).

Para contribuir:

1. Faça fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

ISC
