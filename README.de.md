<div align="center">
  <img src="assets/readme_header_banner.jpg" alt="Heimdall Banner" width="100%"/>

  # 🛠️ BDB DEV Tool Installer
</div>

🌐 **Sprache / Language / Idioma**: [ 🇬🇧 English ](README.md) | **Deutsch** | [ 🇵🇹 Português ](README.pt.md)

---

[![CI](https://github.com/hybridlabor-api/bdb-dev-tool-installer/actions/workflows/ci.yml/badge.svg)](https://github.com/hybridlabor-api/bdb-dev-tool-installer/actions)
[![NPM Version](https://img.shields.io/npm/v/@hybridlabor-api/bdb-dev-tool-installer.svg)](https://www.npmjs.com/package/@hybridlabor-api/bdb-dev-tool-installer)
[![runtime](https://img.shields.io/badge/node-20+-blue.svg)](https://github.com/hybridlabor-api/bdb-dev-tool-installer)
[![license](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![platform](https://img.shields.io/badge/platform-macOS%20|%20Win%20|%20Linux-brightgreen.svg)](https://github.com/hybridlabor-api/bdb-dev-tool-installer)

> **Ein modularer, plattformübergreifender Installer & Updater zur zentralen, reibungslosen Bereitstellung und Verwaltung aller BDB DEV Tools und MCP-Server.**

Dies beinhaltet:
- **Core Tools:** BDB Token-Saver, memB und BDB OpenWiki.
- **BDB MCPs:** Einzelne MCP-Server wie TouchDesigner, Grandma3, Resolume, Unreal Engine, Rhino und mehr.
- **Hybridlabor Repositories:** Klonen und Aktualisieren von Repositories wie `bdb-dev-optimized-agent-skills`, `ebay-kleinanzeigen-api` und weiteren.

Ein erneutes Ausführen des Installers über eine bestehende Installation hinweg führt automatisch Updates durch oder führt ein `git pull` auf geklonten Repositories aus, um sicherzustellen, dass immer die neuesten Versionen vorliegen.

---

## 📦 Verfügbare Tools & Technische Spezifikationen

### 1. ⚡ BDB Token-Saver (Context Window CLI Output Optimizer)

**Token-Saver** ist ein Drop-in Kontextfenster-Optimierer für KI-Coding-Assistenten (Google Antigravity CLI, Claude Code). Er fängt ausführliche CLI-Befehlsausgaben ab — wie `git diff`, `pytest`, `npm install`, `docker`, `kubectl` und `terraform plan` — und komprimiert sie um **60–99 %**, bevor sie das LLM-Kontextfenster erreichen.

#### Hauptfunktionen & Technische Daten:
- **6 Dedizierte BDB MCP Prozessoren:** Maßeinheiten für TouchDesigner, Unreal Engine, After Effects, DaVinci Resolve, Resolume, Rhino, Adobe UXP und memB Vektorspeicher.
- **36 Spezialisierte Prozessoren:** Ausgabekomprimierung für `git`, `test` (pytest, jest, vitest, cargo, go), `docker`, `kubectl`, `terraform`, `package_list` (pip, npm, brew), `build_output` u.v.m.
- **Garantiert 0 % Informationsverlust:** Alle Fehlermeldungen, Stacktraces und relevanten Diffs bleiben zu 100 % erhalten.
- **Rein Deterministische Komprimierung:** Keine zusätzliche Latenz. Keine LLM-Aufrufe erforderlich. Arbeitet offline mit performanter Regex-Analyse.
- **Plattform-Hooks:**
  - **Google Antigravity CLI:** Arbeitet über den `AfterTool` Ausgabe-Ersetzungs-Hook.
  - **Claude Code:** Arbeitet über den `PreToolUse` Wrapper-Interzeptions-Hook.
- **CLI Befehle:**
  ```bash
  heimdall version              # Ausführung der aktuellen Version anzeigen
  heimdall stats                # Kumulierte Token- & Kostenersparnis anzeigen
  heimdall stats --json         # JSON-Statistik exportieren
  heimdall benchmark 'git diff' # Komprimierungsrate für jeden CLI-Befehl messen
  heimdall update               # Automatisch Updates prüfen und anwenden
  ```

---

### 2. 🧠 memB (Local-First Hybrid Long-Term Memory Engine)

**memB** bietet KI-Agenten ein dauerhaftes, durchsuchbares Langzeitgedächtnis über Sitzungen und Projekte hinweg. Es arbeitet als lokaler Model Context Protocol (MCP) Server basierend auf ChromaDB Vektorspeicherung.

#### Hauptfunktionen & Technische Daten:
- **Persistentes Erinnern:** Speichert Benutzereinstellungen, Code-Architekturentscheidungen und Projektkonventionen lokal.
- **Hybride Abfrage:** Kombiniert semantische Ähnlichkeitssuche mit strukturierter Metadaten-Filterung.
- **Datenschutz & Sicherheit:** Läuft zu 100 % lokal auf Ihrer Workstation. Keine externen Cloud-Abhängigkeiten.
- **Automatisches Bootstrapping:** Eigenständige Python Virtual Environment (`.venv`), die vom Installer verwaltet wird.

---

### 3. 📚 BDB OpenWiki (Autonomer Dokumentations-Manager)

**BDB OpenWiki** generiert, aktualisiert und synchronisiert Projektdokumentationen, Architekturdiagramme und Release Notes automatisch auf Basis von Git-Aktivitäten und Codebase-Änderungen.

---

### 4. 🔌 BDB Model Context Protocol (MCP) Ecosystem

**MCP Server** ermöglichen KI-Agenten (Google Antigravity, Claude Code) die Interaktion mit lokaler Hardware, 3D-Engines (Unreal, Rhino, Blender), visueller Synthese-Software (TouchDesigner, Resolume), Lichtpulten (grandMA3) und lokalen Speichern.

---

## 🚀 Schnellstart & Installation

### Option 1: macOS & Linux
```bash
git clone https://github.com/hybridlabor-api/bdb-dev-tool-installer.git
cd bdb-dev-tool-installer
sh install.sh
```

Für automatisierten / unbeaufsichtigten Setup:
```bash
node installer.js -y
```

---

### Option 2: Windows PowerShell
```powershell
git clone https://github.com/hybridlabor-api/bdb-dev-tool-installer.git
cd bdb-dev-tool-installer
powershell -ExecutionPolicy Bypass -File install.ps1
```

---

### Option 3: Via NPX (Globaler Installer)
```bash
npx @hybridlabor-api/bdb-dev-tool-installer
```

---

## 📄 Lizenz

[Apache 2.0](LICENSE) © Hybridlabor / BDB DEV
