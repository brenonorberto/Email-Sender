import fs from "fs"
import path from "path"

export function garantirPastasSistema() {
  const pastas = [
    path.join(process.cwd(), "logs"),
    path.join(process.cwd(), "empresas"),
  ]

  pastas.forEach((pasta) => {
    if (!fs.existsSync(pasta)) {
      try {
        fs.mkdirSync(pasta, { recursive: true })
        console.log(`✅ Pasta criada: ${pasta}`)
      } catch (err) {
        console.error(`❌ Erro ao criar pasta ${pasta}: ${err.message}`)
      }
    }
  })
}
