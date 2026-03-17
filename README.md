# A3-Elite Market Intelligence

> Professional trading analysis platform powered by ICT Smart Money Concepts.
> Available as a standalone desktop app for **Windows**, **macOS**, and **Linux**.

![A3-Elite Screenshot](docs/screenshot.png)

---

## Features

| Module | Description |
|--------|-------------|
| **Unicorn Model** | FVG + Breaker Block overlap detection — highest-probability setups |
| **Order Blocks** | Institutional order block mapping with breaker conversion |
| **Fair Value Gaps** | FVG detection with auto-mitigation tracking |
| **SMT Divergence** | Smart Money Technique cross-pair divergence |
| **AMD Cycle** | Accumulation / Manipulation / Distribution phase detection |
| **Kill Zones** | London Open, NY Open, London Close session timing |
| **Silver Bullet** | 1-hour precision entry windows (3AM / 10AM / 2PM EST) |
| **Multi-TF Confluence** | 5m, 1H, 4H, Daily bias alignment scoring |
| **Live Prices** | Real-time forex (Frankfurter API) + crypto (CoinGecko) |
| **Trade Journal** | Persistent signal log with win rate / R:R statistics |
| **Backtester** | Bar-by-bar replay mode with live signal detection |
| **Scanner** | Multi-pair scan ranking setups by confluence score |

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org) v18 or higher
- npm v8 or higher

### Run in development
```bash
npm install
npm start
```

### Build for your platform
```bash
npm install

# Current platform only
npm run build

# Specific platforms
npm run build:win    # Windows → .exe installer + portable
npm run build:mac    # macOS  → .dmg + .zip (x64 + Apple Silicon)
npm run build:linux  # Linux  → AppImage + .deb + .rpm + Snap
npm run build:all    # All three platforms (requires cross-build tools)
```

Built installers appear in the `dist/` folder.

---

## Platform Build Requirements

### Windows
Build on Windows or use a CI/CD pipeline (GitHub Actions).
Output: `dist/A3-Elite Setup 2.0.0.exe` (NSIS installer) + `dist/A3-Elite 2.0.0.exe` (portable)

### macOS
Build on macOS. For Apple Silicon + Intel universal binaries:
```bash
npm run build:mac
```
Output: `dist/A3-Elite-2.0.0.dmg` (drag-to-Applications installer)

For notarization (required for distribution outside App Store):
```bash
APPLE_ID=you@email.com \
APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx \
APPLE_TEAM_ID=XXXXXXXXXX \
npm run build:mac
```

### Linux
```bash
npm run build:linux
```
Output:
- `dist/A3-Elite-2.0.0.AppImage` — universal, runs on any distro
- `dist/a3-elite_2.0.0_amd64.deb` — Debian / Ubuntu
- `dist/a3-elite-2.0.0.x86_64.rpm` — Fedora / RHEL
- `dist/a3-elite_2.0.0_amd64.snap` — Snap Store

---

## Cross-Platform Build via GitHub Actions

Create `.github/workflows/build.yml`:

```yaml
name: Build A3-Elite

on:
  push:
    tags: ['v*']

jobs:
  build:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - uses: actions/upload-artifact@v4
        with:
          name: dist-${{ matrix.os }}
          path: dist/
```

This automatically builds for all 3 platforms on every tagged release.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + R` | Run analysis |
| `Ctrl/Cmd + Shift + R` | Scan all pairs |
| `Ctrl/Cmd + L` | Refresh live prices |
| `Ctrl/Cmd + S` | Export report HTML |
| `Ctrl/Cmd + Shift + S` | Export journal CSV |
| `Ctrl/Cmd + 1–8` | Switch tabs |
| `Ctrl/Cmd + =/-` | Zoom in/out |
| `F11` | Toggle fullscreen |

---

## Data Sources

| Data | Source | Key Required |
|------|--------|--------------|
| Forex rates | [Frankfurter.app](https://frankfurter.app) | No |
| Crypto prices | [CoinGecko API](https://coingecko.com) | No |
| Live charts | [TradingView Widget](https://tradingview.com) | No |
| Metals / Indices | Seeded realistic demo data | — |

---

## Project Structure

```
a3-elite-app/
├── main.js              ← Electron main process
├── preload.js           ← Secure context bridge
├── package.json         ← Dependencies + build config
├── src/
│   └── index.html       ← Full app (HTML + CSS + JS)
├── build-resources/
│   ├── icon.ico         ← Windows icon
│   ├── icon.icns        ← macOS icon
│   ├── icon.png         ← Linux icon
│   ├── icons/           ← PNG sizes (16–512px) for Linux
│   ├── dmg-background.png
│   ├── entitlements.mac.plist
│   └── installer.nsh    ← NSIS Windows installer script
└── dist/                ← Built installers (generated)
```

---

## ⚠ Disclaimer

A3-Elite is provided **for educational purposes only**. It does not constitute financial advice. Trading involves significant risk of loss. Always do your own research and consult a licensed financial advisor before making any trading decisions.

---

## License

MIT © 2024 A3EN
