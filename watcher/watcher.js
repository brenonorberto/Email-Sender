import chokidar from "chokidar"
import path from "path"
import { config } from "../config/env.js"
import { logger, obterTimestampBrasileiro } from "../utils/logger.js"

export function iniciarWatcher(callback) {
  // BUG 5 FIX: fila gerenciada com array limpo após processamento
  const fila = {}

  // BUG 2 FIX: usar config.rootFolder em vez de string hardcoded "empresas"
  const rootFolder = config.rootFolder

  const watcher = chokidar.watch(rootFolder, {
    ignored: [
      // BUG 1 FIX: regex cross-platform para ignorar ENVIADOS e ERRO
      (filePath) =>
        /[/\\]ENVIADOS([/\\]|$)/i.test(filePath) ||
        /[/\\]ERRO([/\\]|$)/i.test(filePath) ||
        /(^|[/\\])\../.test(filePath), // arquivos ocultos
    ],
    ignoreInitial: true,
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100,
    },
  })

  watcher.on("add", (filePath) => {
    // BUG 3 FIX: extrair empresa dinamicamente relativa ao rootFolder
    const relativePath = path.relative(rootFolder, filePath)
    const partes = relativePath.split(path.sep)
    const empresa = partes[0]

    // BUG 6 FIX: validar que o arquivo está dentro de uma subpasta de empresa
    if (!empresa || partes.length < 2) {
      logger.warn(
        `Arquivo ignorado (não está em subpasta de empresa): ${filePath}`,
      )
      return
    }

    if (!fila[empresa]) fila[empresa] = []

    // evitar duplicatas na fila
    if (!fila[empresa].includes(filePath)) {
      fila[empresa].push(filePath)
      // BUG 4 FIX: usar logger em vez de console.log
      const nomeArquivo = path.basename(filePath)
      const agora = new Date()
      const timestamp = `[${agora.toLocaleDateString("pt-BR")} ${agora.toLocaleTimeString("pt-BR")}]: `
      logger.info(
        `${timestamp}📥  Arquivo detectado e adicionado à fila: ${nomeArquivo}`,
      )
      logger.info(`${timestamp}📁 Empresa: ${empresa}`)
      logger.info(`${timestamp}📍 Caminho: ${filePath}`)
    }
  })

  watcher.on("error", (err) => {
    logger.error(`Erro no watcher: ${err.message}`)
  })

  setInterval(() => {
    // BUG 5 FIX: callback recebe fila e deve limpar após processar
    callback(fila)
  }, config.sendInterval)

  logger.info(`Watcher iniciado em: ${path.resolve(rootFolder)}`)
}
