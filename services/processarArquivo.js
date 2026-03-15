import path from "path"
import empresas from "../data/empresas.json" with { type: "json" }
import { enviarEmail } from "./emailService.js"
import { logger } from "../utils/logger.js"
import { config } from "../config/env.js"

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

  await enviarEmail(empresaConfig.nome, emails, [filePath])
}

export async function processarFila(fila) {
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

    await enviarEmail(empresaConfig.nome, emails, arquivos)

    // limpar a fila após envio
    fila[empresa] = []
  }
}
