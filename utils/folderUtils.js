import fs from "fs"

export function garantirPastasSistema() {
  const pastas = ["./logs", "./empresas"]

  pastas.forEach((pasta) => {
    if (!fs.existsSync(pasta)) {
      fs.mkdirSync(pasta)
      console.log("Pasta criada:", pasta)
    }
  })
}
