import nodemailer from "nodemailer"
import { logger } from "../utils/logger.js"

// Validar que credenciais existem
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error(
    "❌ ERRO CRÍTICO: EMAIL_USER e EMAIL_PASS não configurados no .env",
  )
  console.error("Configure o arquivo .env com suas credenciais Gmail")
  process.exit(1)
}

export const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Teste de conexão com Gmail (executado uma única vez na inicialização)
export async function testarConexaoEmail() {
  try {
    const info = await transporter.verify()
    if (info) {
      logger.info("✅ Conexão com Gmail verificada com sucesso")
      return true
    }
  } catch (err) {
    logger.error(`❌ Falha ao conectar com Gmail: ${err.message}`)
    logger.error(
      "Verifique se: 1) EMAIL_USER está correto, 2) EMAIL_PASS é uma App Password, 3) 2FA está habilitado no Gmail",
    )
    return false
  }
}
