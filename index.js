import { iniciarWatcher } from "./watcher/watcher.js"
import { processarFila } from "./services/processarArquivo.js"
import { garantirPastasSistema } from "./utils/folderUtils.js"
import { config } from "./config/env.js"
import { logger } from "./utils/logger.js"
import { testarConexaoEmail } from "./config/email.js"

// Criar pastas necessárias antes de iniciar
garantirPastasSistema()

// Validar variáveis de ambiente críticas
if (!config.emailUser || !config.emailPass) {
  console.error(
    "❌ Erro: EMAIL_USER e EMAIL_PASS não configuradas em .env ou não existem",
  )
  process.exit(1)
}

if (!config.rootFolder) {
  console.error("❌ Erro: ROOT_FOLDER não configurada em .env")
  process.exit(1)
}

logger.info("✅ Variáveis de ambiente validadas")
logger.info(`📁 Pasta monitorada: ${config.rootFolder}`)

// Testar conexão com Gmail antes de iniciar o watcher
logger.info("🔐 Testando conexão com Gmail...")
const coneccaoOk = await testarConexaoEmail()

if (!coneccaoOk) {
  console.error(
    "❌ Não foi possível conectar ao Gmail. Verifique as credenciais e tente novamente.",
  )
  process.exit(1)
}

logger.info("🎯 Iniciando sistema de monitoramento...")
iniciarWatcher(processarFila)
