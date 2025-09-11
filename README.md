# sbom2notice

Local-first tool for developers and compliance managers to **convert SBOMs (SPDX / CycloneDX)** into structured `NOTICE` files.

- Runs entirely **in your browser** — no uploads, no servers.
- **GDPR-friendly by design** (suitable for EU/DE companies).
- Drag & drop your SBOM JSON, validate it, and generate a NOTICE skeleton.
- Edit gaps via a built-in **Form Builder** with progress tracking.
- Save drafts locally, reopen anytime, download final NOTICE.

## 🚀 Live Demo

**GitHub Pages:** https://trustsource.github.io/sbom2notice/

## Tech Stack
- [Next.js 15 (App Router)](https://nextjs.org/)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [shadcn/ui 3.2.1](https://ui.shadcn.com/)
- [i18next](https://www.i18next.com/)
- Local-first persistence (`localStorage`)

## Getting Started

Clone the repo and install dependencies:
```bash
git clone https://github.com/TrustSource/sbom2notice.git
cd sbom2notice
pnpm install
```

Run in development mode:
```bash
pnpm dev
```

Build for production:
```bash
pnpm build && pnpm start
```

The app will be available at http://localhost:3000

## Usage

- Open the app in your browser.
- Upload or drag & drop an SBOM file (.json).
- The app validates the file and converts it into a NOTICE skeleton.
- Navigate to /notice to view all saved files.
- Open any NOTICE to:
  - Review or edit fields.
  - Track completion.
  - Copy or download the final JSON.

## Contributing

Contributions, issues, and feature requests are welcome!
Open an issue or submit a pull request.
