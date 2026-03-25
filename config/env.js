import dotenv from "dotenv"
import path from "path"

dotenv.config({ quiet: true })

export const config = {
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  smtpService: process.env.SMTP_SERVICE,
  // Padrão relativo ao diretório atual (funciona em Windows, Linux e macOS)
  rootFolder: process.env.ROOT_FOLDER || path.join(process.cwd(), "empresas"),
  sendInterval: Number(process.env.SEND_INTERVAL || 600000),
  // caminho opcional para uma imagem de assinatura (CID)
  signatureImagePath: process.env.SIGNATURE_IMAGE_PATH,
  // texto de assinatura que pode incluir quebras de linha
  signatureText: process.env.SIGNATURE_TEXT,
  logMaxSizeMB: Number(process.env.LOG_MAX_SIZE_MB || 10),
}
