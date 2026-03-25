import fs from "fs"
import path from "path"
import { config } from "../config/env.js"

// Usar path.join() para compatibilidade cross-platform (Windows, Linux, macOS)
const APP_LOG = path.join(process.cwd(), "logs", "app.log")
const ERROR_LOG = path.join(process.cwd(), "logs", "error.log")

function formatarDataBrasileira(data) {
  const dia = String(data.getDate()).padStart(2, "0")
  const mes = String(data.getMonth() + 1).padStart(2, "0")
  const ano = data.getFullYear()
  const horas = String(data.getHours()).padStart(2, "0")
  const minutos = String(data.getMinutes()).padStart(2, "0")
  const segundos = String(data.getSeconds()).padStart(2, "0")
  return `${dia}-${mes}-${ano} ${horas}:${minutos}:${segundos}`
}

function obterTimestamp() {
  return `[${formatarDataBrasileira(new Date())}]`
}

function getDia(data) {
  const dia = String(data.getDate()).padStart(2, "0")
  const mes = String(data.getMonth() + 1).padStart(2, "0")
  const ano = data.getFullYear()
  return `${dia}-${mes}-${ano}`
}

const ultimoDia = {
  [APP_LOG]: null,
  [ERROR_LOG]: null,
}

function escreverLog(arquivo, mensagem) {
  const timestamp = formatarDataBrasileira(new Date())
  const diaAtual = getDia(new Date())

  // Verificar tamanho do arquivo e limpar se necessário
  try {
    const stats = fs.statSync(arquivo)
    if (stats.size > config.logMaxSizeMB * 1024 * 1024) {
      fs.writeFileSync(arquivo, "")
      // Resetar o último dia após limpar
      ultimoDia[arquivo] = null
    }
  } catch (err) {
    // Arquivo não existe ainda, continuar
  }

  if (ultimoDia[arquivo] !== null && ultimoDia[arquivo] !== diaAtual) {
    fs.appendFileSync(arquivo, "\n")
  }
  ultimoDia[arquivo] = diaAtual
  const linha = `[${timestamp}] ${mensagem}\n`
  fs.appendFileSync(arquivo, linha)
}

export const logger = {
  info(mensagem) {
    console.log(mensagem)
    escreverLog(APP_LOG, mensagem)
  },

  warn(mensagem) {
    console.warn(mensagem)
    escreverLog(APP_LOG, mensagem)
  },

  error(mensagem) {
    console.error(mensagem)
    escreverLog(ERROR_LOG, mensagem)
  },
}

export function obterTimestampBrasileiro() {
  return obterTimestamp()
}
