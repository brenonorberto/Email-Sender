import fs from "fs"
import path from "path"

export function moverParaEnviados(filePath) {
  if (filePath.split(path.sep).includes("ENVIADOS")) {
    return filePath
  }

  const dir = path.dirname(filePath)
  const enviados = path.join(dir, "ENVIADOS")

  if (!fs.existsSync(enviados)) {
    fs.mkdirSync(enviados, { recursive: true })
  }

  const destino = path.join(enviados, path.basename(filePath))
  fs.renameSync(filePath, destino)

  return destino
}

export function moverParaErro(filePath) {
  if (filePath.split(path.sep).includes("ERRO")) {
    return filePath
  }

  const dir = path.dirname(filePath)
  const erro = path.join(dir, "ERRO")

  if (!fs.existsSync(erro)) {
    fs.mkdirSync(erro, { recursive: true })
  }

  const destino = path.join(erro, path.basename(filePath))
  fs.renameSync(filePath, destino)

  return destino
}
