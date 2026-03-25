#!/usr/bin/env node

/**
 * Setup Script - Email Sender
 * Executa verificações iniciais e ajuda na configuração do projeto
 * Compatível com Windows, Linux e macOS
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const RED = "\x1b[31m"
const GREEN = "\x1b[32m"
const YELLOW = "\x1b[33m"
const BLUE = "\x1b[34m"
const RESET = "\x1b[0m"

function log(color, text) {
  console.log(`${color}${text}${RESET}`)
}

function logSection(title) {
  console.log("\n" + "=".repeat(60))
  log(BLUE, `  ${title}`)
  console.log("=".repeat(60) + "\n")
}

function logSuccess(text) {
  log(GREEN, `✅ ${text}`)
}

function logWarning(text) {
  log(YELLOW, `⚠️  ${text}`)
}

function logError(text) {
  log(RED, `❌ ${text}`)
}

function logInfo(text) {
  console.log(`ℹ️  ${text}`)
}

// Verificar dependências
function verificarDependencias() {
  logSection("1️⃣  Verificação de Dependências")

  const packageJsonPath = path.join(__dirname, "package.json")
  if (!fs.existsSync(packageJsonPath)) {
    logError("package.json não encontrado!")
    return false
  }

  const nodeModulesPath = path.join(__dirname, "node_modules")
  if (!fs.existsSync(nodeModulesPath)) {
    logWarning("node_modules não encontrado")
    logInfo("Execute: npm install")
    return false
  }

  logSuccess("Dependências instaladas")
  return true
}

// Verificar pastas sistema
function verificarPastas() {
  logSection("2️⃣  Verificação de Pastas")

  const pastasNecessarias = [
    path.join(__dirname, "logs"),
    path.join(__dirname, "empresas"),
  ]

  pastasNecessarias.forEach((pasta) => {
    if (!fs.existsSync(pasta)) {
      try {
        fs.mkdirSync(pasta, { recursive: true })
        logSuccess(`Pasta criada: ${pasta}`)
      } catch (err) {
        logError(`Erro ao criar pasta ${pasta}: ${err.message}`)
      }
    } else {
      logSuccess(`Pasta existe: ${pasta}`)
    }
  })
}

// Verificar .env
function verificarEnv() {
  logSection("3️⃣  Verificação de Variáveis de Ambiente (.env)")

  const envPath = path.join(__dirname, ".env")
  const envExamplePath = path.join(__dirname, ".env.example")

  if (!fs.existsSync(envPath)) {
    logWarning(".env não encontrado")

    if (fs.existsSync(envExamplePath)) {
      logInfo("Copiando .env.example para .env...")
      fs.copyFileSync(envExamplePath, envPath)
      logSuccess(".env criado de .env.example")
      logInfo("Abra .env e configure suas credenciais Gmail")
    }
  } else {
    logSuccess(".env encontrado")
  }

  // Ler .env se existir
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8")
    const emailUserConfigured =
      content.includes("EMAIL_USER=") && !content.match(/EMAIL_USER=seu@/i)
    const emailPassConfigured =
      content.includes("EMAIL_PASS=") && !content.match(/EMAIL_PASS=xxxx/i)

    if (!emailUserConfigured || !emailPassConfigured) {
      logWarning("Credenciais Gmail não configuradas")
      logInfo("Abra .env e preencha:")
      logInfo("  - EMAIL_USER: seu-email@gmail.com")
      logInfo("  - EMAIL_PASS: seu-app-password-16-caracteres")
    } else {
      logSuccess("Credenciais Gmail configuradas")
    }
  }
}

// Verificar estrutura de empresas
function verificarEmpresasJson() {
  logSection("4️⃣  Verificação de Configuração de Empresas")

  const empresasPath = path.join(__dirname, "data", "empresas.json")

  if (!fs.existsSync(empresasPath)) {
    logError("empresas.json não encontrado!")
    return
  }

  try {
    const empresas = JSON.parse(fs.readFileSync(empresasPath, "utf8"))
    logSuccess(`${empresas.length} empresa(s) configurada(s)`)

    empresas.forEach((emp) => {
      const emails = Array.isArray(emp.emails)
        ? emp.emails.join(", ")
        : emp.email
      logInfo(`  - ${emp.nome}: ${emails}`)
    })
  } catch (err) {
    logError(`Erro ao ler empresas.json: ${err.message}`)
  }
}

// Verificar estrutura de diretórios de empresas
function verificarDireturiosEmpresas() {
  logSection("5️⃣  Verificação de Diretórios de Empresas")

  const empresasDir = path.join(__dirname, "empresas")

  if (!fs.existsSync(empresasDir)) {
    logWarning(
      `Diretório ${empresasDir} não encontrado - será criado ao usar o app`,
    )
    return
  }

  const empresas = fs.readdirSync(empresasDir)

  if (empresas.length === 0) {
    logWarning("Nenhuma pasta de empresa em ./empresas")
    logInfo("Crie subpastas para cada empresa, ex: ./empresas/empresa1/")
    return
  }

  empresas.forEach((empresa) => {
    const caminhoEmpresa = path.join(empresasDir, empresa)
    const stats = fs.statSync(caminhoEmpresa)

    if (stats.isDirectory()) {
      const enviadosPath = path.join(caminhoEmpresa, "ENVIADOS")
      const erroPath = path.join(caminhoEmpresa, "ERRO")

      logInfo(`  📁 ${empresa}`)

      if (!fs.existsSync(enviadosPath)) {
        logWarning(`    ⚠️  Pasta ENVIADOS não existe`)
      }

      if (!fs.existsSync(erroPath)) {
        logWarning(`    ⚠️  Pasta ERRO não existe`)
      }
    }
  })
}

// Informações do sistema
function mostrarInfoSistema() {
  logSection("6️⃣  Informações do Sistema")

  logInfo(
    `SO: ${process.platform === "win32" ? "Windows" : process.platform === "darwin" ? "macOS" : "Linux"}`,
  )
  logInfo(`Node.js: ${process.version}`)
  logInfo(`Diretório atual: ${process.cwd()}`)
  logInfo(`Projeto em: ${__dirname}`)
}

// Executar todas as verificações
function executarVerificacoes() {
  logSection("Executando Verificações...")

  if (!verificarDependencias()) {
    logError("Instale as dependências com: npm install")
    return
  }

  verificarPastas()
  verificarEnv()
  verificarEmpresasJson()
  verificarDireturiosEmpresas()
  mostrarInfoSistema()

  logSection("✅ Setup Concluído!")
  logInfo("Execute a aplicação com: npm start")
}

// Entrada principal
function main() {
  console.clear()
  log(BLUE, "╔════════════════════════════════════════════════════════╗")
  log(BLUE, "║          EMAIL SENDER - SETUP                          ║")
  log(BLUE, "║  Verificação de compatibilidade cross-platform         ║")
  log(BLUE, "╚════════════════════════════════════════════════════════╝\n")

  executarVerificacoes()
}

main()
