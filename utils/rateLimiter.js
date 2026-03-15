import { logger } from "./logger.js"

// Gmail permite ~500 emails/dia em contas pessoais
// Usamos 450 como margem de segurança
const GMAIL_DAILY_LIMIT = Number(process.env.GMAIL_DAILY_LIMIT) || 450

let emailsSentToday = 0
let lastResetDate = new Date().toDateString()

function resetIfNewDay() {
  const today = new Date().toDateString()
  if (today !== lastResetDate) {
    logger.info(
      `Rate limiter: reset diário. Enviados ontem: ${emailsSentToday}`,
    )
    emailsSentToday = 0
    lastResetDate = today
  }
}

/**
 * Verifica se ainda é possível enviar emails hoje.
 * Lança erro se o limite diário foi atingido.
 */
export function checkRateLimit() {
  resetIfNewDay()

  if (emailsSentToday >= GMAIL_DAILY_LIMIT) {
    throw new Error(
      `Limite diário do Gmail atingido (${emailsSentToday}/${GMAIL_DAILY_LIMIT}). ` +
        `Próximo reset à meia-noite.`,
    )
  }
}

/**
 * Registra um email como enviado.
 * Deve ser chamado APÓS envio bem-sucedido.
 */
export function registerEmailSent() {
  resetIfNewDay()
  emailsSentToday++
  logger.info(
    `Rate limiter: ${emailsSentToday}/${GMAIL_DAILY_LIMIT} emails enviados hoje`,
  )
}

/**
 * Retorna o status atual do rate limiter.
 */
export function getRateLimitStatus() {
  resetIfNewDay()
  return {
    enviados: emailsSentToday,
    limite: GMAIL_DAILY_LIMIT,
    disponivel: GMAIL_DAILY_LIMIT - emailsSentToday,
    resetEm: "meia-noite (horário local)",
  }
}
