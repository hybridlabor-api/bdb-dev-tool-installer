<div align="center">
  <img src="assets/readme_header_banner.jpg" alt="Heimdall Banner" width="100%"/>

  # 🛠️ BDB DEV Tool Installer
</div>

🌐 **Idioma / Language / Sprache**: [ 🇬🇧 English ](README.md) | [ 🇩🇪 Deutsch ](README.de.md) | **Português**

---

[![CI](https://github.com/hybridlabor-api/bdb-dev-tool-installer/actions/workflows/ci.yml/badge.svg)](https://github.com/hybridlabor-api/bdb-dev-tool-installer/actions)
[![NPM Version](https://img.shields.io/npm/v/@hybridlabor-api/bdb-dev-tool-installer.svg)](https://www.npmjs.com/package/@hybridlabor-api/bdb-dev-tool-installer)
[![runtime](https://img.shields.io/badge/node-20+-blue.svg)](https://github.com/hybridlabor-api/bdb-dev-tool-installer)
[![license](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![platform](https://img.shields.io/badge/platform-macOS%20|%20Win%20|%20Linux-brightgreen.svg)](https://github.com/hybridlabor-api/bdb-dev-tool-installer)

> **Um instalador e atualizador modular e multiplataforma projetado para implantar, gerenciar e atualizar centralizadamente todas as ferramentas BDB DEV e servidores MCP sem atrito.**

Isso inclui:
- **Ferramentas Principais:** BDB Token-Saver, memB e BDB OpenWiki.
- **BDB MCPs:** Servidores MCP individuais para TouchDesigner, Grandma3, Resolume, Unreal Engine, Rhino e muito mais.
- **Repositórios Hybridlabor:** Clonagem e atualização completa de repositórios como `bdb-dev-optimized-agent-skills`, `ebay-kleinanzeigen-api` e outros.

Executar o instalador novamente em uma instalação existente atualizará automaticamente as ferramentas ou executará um `git pull` nos repositórios clonados.

---

## 📦 Visão Geral das Ferramentas & Especificações Técnicas

### 1. ⚡ BDB Token-Saver (Otimizador de Saída CLI para Janela de Contexto)

**Token-Saver** é um otimizador de janela de contexto drop-in para assistentes de código de IA (Google Antigravity CLI, Claude Code). Ele intercepta saídas de comandos CLI — como `git diff`, `pytest`, `npm install`, `docker`, `kubectl` e `terraform plan` — comprimindo-as em **60–99%** antes que alcancem o LLM.

---

### 2. 🧠 memB (Motor de Memória de Longo Prazo Híbrido Local-First)

**memB** fornece aos agentes de IA uma memória de longo prazo persistente e pesquisável em sessões e projetos. Ele opera como um servidor MCP local baseado em armazenamento vetorial ChromaDB.

---

### 3. 📚 BDB OpenWiki (Gerenciador de Documentação Autônomo)

**BDB OpenWiki** gera, atualiza e sincroniza automaticamente a documentação do projeto, diagramas de arquitetura e notas de lançamento com base nas atividades do Git.

---

### 4. 🔌 Ecossistema BDB Model Context Protocol (MCP)

Os **Servidores MCP** permitem que os agentes de IA interajam com hardware local, motores 3D (Unreal, Rhino, Blender), softwares de síntese visual (TouchDesigner, Resolume), consoles de iluminação (grandMA3) e memória local.

---

## 🚀 Início Rápido & Instalação

### Opção 1: macOS & Linux
```bash
git clone https://github.com/hybridlabor-api/bdb-dev-tool-installer.git
cd bdb-dev-tool-installer
sh install.sh
```

Para configuração automatizada:
```bash
node installer.js -y
```

---

### Opção 2: Windows PowerShell
```powershell
git clone https://github.com/hybridlabor-api/bdb-dev-tool-installer.git
cd bdb-dev-tool-installer
powershell -ExecutionPolicy Bypass -File install.ps1
```

---

### Opção 3: Via NPX (Instalador Global)
```bash
npx @hybridlabor-api/bdb-dev-tool-installer
```

---

## 📄 Licenciamento

[Apache 2.0](LICENSE) © Hybridlabor / BDB DEV
