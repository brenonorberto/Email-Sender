import { iniciarWatcher } from "./watcher/watcher.js"
import { processarFila } from "./services/processarArquivo.js"

iniciarWatcher(processarFila)
