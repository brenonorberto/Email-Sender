import { transporter } from "../config/email.js"
import { config } from "../config/env.js"
import path from "path"
import fs from "fs"
import { logger, obterTimestampBrasileiro } from "../utils/logger.js"
import { moverParaEnviados, moverParaErro } from "../utils/fileUtils.js"
import { checkRateLimit, registerEmailSent } from "../utils/rateLimiter.js"

// BUG 8 FIX: retry logic com backoff exponencial
const MAX_RETRIES = Number(process.env.MAX_RETRIES) || 3

function obterTimestampComProcessId(processId) {
  const timestamp = `[${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}]`
  const prefix = processId ? ` [${processId}]` : ""
  return `${timestamp}${prefix}:`
}

async function enviarComRetry(mailOptions, tentativa = 1, processId = "") {
  try {
    const logPrefix = obterTimestampComProcessId(processId)
    logger.info(
      `${logPrefix} [Tentativa ${tentativa}/${MAX_RETRIES}] Enviando email para ${mailOptions.to}...`,
    )
    const resultado = await transporter.sendMail(mailOptions)
    logger.info(
      `${logPrefix} ✅ Email enviado com sucesso. Message ID: ${resultado.messageId}`,
    )
    return resultado
  } catch (err) {
    const logPrefix = obterTimestampComProcessId(processId)
    logger.error(
      `${logPrefix} ❌ Erro na tentativa ${tentativa}: ${err.message}`,
    )

    if (tentativa < MAX_RETRIES) {
      const delayMs = 5000 * tentativa
      logger.warn(
        `${logPrefix} ⏳ Retentando em ${delayMs}ms... (Tentativa ${tentativa}/${MAX_RETRIES})`,
      )
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      return enviarComRetry(mailOptions, tentativa + 1, processId)
    }
    throw err // esgotou tentativas — propaga o erro
  }
}

export async function enviarEmail(empresa, emails, arquivos, processId = "") {
  const logPrefix = obterTimestampComProcessId(processId)

  logger.info(`${logPrefix} 🚀 INICIANDO ENVIO PARA ${empresa.toUpperCase()}`)

  // BUG 11 FIX: suporte a múltiplos destinatários (string ou array)
  const destinatarios = Array.isArray(emails) ? emails.join(", ") : emails

  // BUG 12 FIX: attachments com filename explícito e encoding seguro
  const attachments = []
  for (const file of arquivos) {
    const filePath = path.resolve(file)

    if (!fs.existsSync(filePath)) {
      logger.warn(`${logPrefix} Arquivo não encontrado, ignorado: ${filePath}`)
      continue
    }

    attachments.push({
      filename: path.basename(filePath),
      path: filePath,
      encoding: "base64",
    })
  }

  if (attachments.length === 0) {
    logger.warn(
      `${logPrefix} Nenhum arquivo válido para enviar à empresa ${empresa}`,
    )
    return { sucesso: false, arquivos: [] }
  }

  try {
    // Verificar limite diário ANTES de tentar enviar
    checkRateLimit()

    // construir corpo com assinatura opcional
    const signatureText = config.signatureText || ""
    const signatureHtml = signatureText
      .split("\n")
      .map((line) => `<p>${line}</p>`)
      .join("")

    let htmlBody = `
      <p>Olá,</p>
      <p>Segue(m) ${attachments.length} arquivo(s) em anexo referente(s) à empresa ${empresa}.</p>
    `

    let textBody = `Olá,\n\nSegue(m) ${attachments.length} arquivo(s) em anexo referente(s) à empresa ${empresa}.`

    // se houver imagem de assinatura, adiciona como anexo CID e não inclui texto
    let imageUsed = false
    if (config.signatureImagePath) {
      const sigPath = path.resolve(config.signatureImagePath)
      if (fs.existsSync(sigPath)) {
        attachments.push({
          filename: path.basename(sigPath),
          path: sigPath,
          cid: "assinatura",
        })
        htmlBody += `<p><img src=\"cid:assinatura\"/></p>`
        imageUsed = true
      } else {
        logger.warn(
          `${logPrefix} Assinatura de imagem não encontrada: ${sigPath}`,
        )
      }
    }

    // se não usarmos imagem, anexa texto de assinatura aos corpos
    if (!imageUsed && signatureText) {
      htmlBody += signatureHtml
      textBody += `\n\n${signatureText}`
    }

    logger.info(`${logPrefix} 📧 Destinatário(s): ${destinatarios}`)
    logger.info(`${logPrefix} 📎 Arquivo(s): ${attachments.length}`)

    // BUG 8 FIX: usa retry em vez de envio direto
    await enviarComRetry(
      {
        from: process.env.EMAIL_USER,
        to: destinatarios,
        subject: `Arquivos enviados - ${empresa}`,
        text: textBody,
        html: htmlBody,
        attachments,
      },
      1,
      processId,
    )

    // Registrar envio bem-sucedido no rate limiter
    registerEmailSent()

    // BUG 7 FIX: mover arquivos APÓS log de sucesso, com log correto do destino
    for (const file of arquivos) {
      const origem = path.resolve(file)
      if (!fs.existsSync(origem)) continue

      const destino = moverParaEnviados(origem)
      logger.info(
        `${logPrefix} ✅ Arquivo movido para ENVIADOS: ${path.basename(destino)}`,
      )
    }

    logger.info(
      `${logPrefix} ✨ ENVIO PARA ${empresa.toUpperCase()} CONCLUÍDO COM SUCESSO\n`,
    )

    // BUG 5 FIX: retornar lista de arquivos processados para limpeza da fila
    return { sucesso: true, arquivos }
  } catch (err) {
    // BUG 9 + 10 FIX: mover para ERRO/ após esgotar tentativas, não silenciar
    logger.error(
      `${logPrefix} ❌ Erro ao enviar email para ${empresa} após ${MAX_RETRIES} tentativas: ${err.message}`,
    )

    for (const file of arquivos) {
      const origem = path.resolve(file)
      if (!fs.existsSync(origem)) continue

      const destino = moverParaErro(origem)
      logger.error(
        `${logPrefix} ❌ Arquivo movido para ERRO: ${path.basename(destino)}`,
      )
    }

    logger.error(`${logPrefix} ❌ ENVIO PARA ${empresa.toUpperCase()} FALHOU\n`)

    return { sucesso: false, arquivos }
  }
}
