import path from "path"
import empresas from "../data/empresas.json" with { type: "json" }
import { enviarEmail } from "./emailService.js"
import { logger, obterTimestampBrasileiro } from "../utils/logger.js"
import { config } from "../config/env.js"

function gerarProcessId() {
  return Math.random().toString(36).substring(2, 9).toUpperCase()
}

function normalizarCNPJ(cnpj) {
  return cnpj.replace(/\D/g, "")
}

function encontrarEmpresa(nomeEmpresa) {
  const normalizedInput = normalizarCNPJ(nomeEmpresa)
  return empresas.find((e) => normalizarCNPJ(e.nome) === normalizedInput)
}

// Compatibilidade retroativa: aceita "email" (string) ou "emails" (array)
function getEmails(empresaConfig) {
  if (empresaConfig.emails) return empresaConfig.emails
  if (empresaConfig.email) return [empresaConfig.email]
  return []
}

export async function processarArquivo(filePath) {
  const normalized = filePath.replace(/\\/g, "/")
  if (normalized.includes("/ENVIADOS/") || normalized.includes("/ERRO/")) {
    return
  }

  // FIX: extrair empresa dinamicamente relativa ao rootFolder
  const relativePath = path.relative(config.rootFolder, filePath)
  const empresa = relativePath.split(path.sep)[0]

  const empresaConfig = encontrarEmpresa(empresa)

  if (!empresaConfig) {
    logger.warn(`Empresa não encontrada: ${empresa}`)
    return
  }

  const emails = getEmails(empresaConfig)
  if (!emails.length) {
    logger.error(`Nenhum email configurado para empresa: ${empresa}`)
    return
  }

  const processId = gerarProcessId()
  await enviarEmail(empresaConfig.nome, emails, [filePath], processId)
}

export async function processarFila(fila) {
  const processId = gerarProcessId()
  let totalArquivos = 0

  // Contar total de arquivos
  for (const empresa in fila) {
    totalArquivos += fila[empresa].length
  }

  if (totalArquivos === 0) return

  logger.info(`\n${"=".repeat(70)}`)
  logger.info(
    `[${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}]  🔄 [${processId}] INICIANDO PROCESSAMENTO DE FILA`,
  )
  logger.info(
    `[${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}]  📦 Total de arquivos: ${totalArquivos}`,
  )
  logger.info(`${"=".repeat(70)}\n`)

  for (const empresa in fila) {
    const arquivos = fila[empresa]

    if (!arquivos.length) continue

    const empresaConfig = encontrarEmpresa(empresa)

    if (!empresaConfig) {
      logger.warn(`Empresa não encontrada: ${empresa}`)
      continue
    }

    const emails = getEmails(empresaConfig)
    if (!emails.length) {
      logger.error(`Nenhum email configurado para empresa: ${empresa}`)
      continue
    }

    await enviarEmail(empresaConfig.nome, emails, arquivos, processId)

    // limpar a fila após envio
    fila[empresa] = []
  }

  logger.info(`${"=".repeat(70)}`)
  logger.info(
    `[${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}] ✅ [${processId}] PROCESSAMENTO DE FILA CONCLUÍDO`,
  )
  logger.info(`${"=".repeat(70)}\n`)
}
