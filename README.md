# Retiro · Planificador financiero

Single-page app para modelar la trayectoria de tu portafolio hacia el retiro. Ajusta tu capital, asignación entre clases de activo, aportaciones, inflación y horizonte — la app proyecta año a año, descuenta a valor presente y compara escenarios de retiro al 3.5% / 4% / 5%.

100% client-side. Sin backend, sin auth, sin telemetría. Tus datos se guardan en `localStorage`.

## Stack

- Vite 5 + React 18 + TypeScript
- Tailwind CSS 3
- Recharts (visualización)
- Vitest (tests de la lógica de cálculo)

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Build de producción

```bash
npm run build
npm run preview   # opcional, para verificar el build
```

El output queda en `dist/`.

## Tests

```bash
npm test          # corre una vez
npm run test:watch
```

Los tests cubren la lógica de proyección y los escenarios de retiro (`src/utils/calculations.test.ts`).

## Deploy a Vercel

Dos opciones:

**Opción A — UI (recomendado):**
1. Crea repo en GitHub: `gh repo create retiro-app --public --source=. --push` (o sube manualmente).
2. En [vercel.com](https://vercel.com) → "Add New Project" → importa el repo.
3. Vercel auto-detecta Vite. Acepta los defaults y deploy.

**Opción B — CLI:**
```bash
npx vercel       # primer deploy (preview)
npx vercel --prod
```

`vercel.json` ya está configurado con el SPA fallback.

## Estructura

```
src/
├── App.tsx                 # composición y useMemo de proyección
├── main.tsx
├── types.ts                # Asset, PlannerInputs, YearProjection
├── constants.ts            # defaults + schema version
├── utils/
│   ├── calculations.ts     # núcleo: projectPortfolio, withdrawalScenarios
│   ├── calculations.test.ts
│   ├── format.ts           # formatCurrency, formatCompact, formatPercent
│   └── storage.ts          # localStorage versionado
├── hooks/
│   ├── usePersistedState.ts
│   └── useAnimatedNumber.ts
└── components/
    ├── ControlPanel.tsx
    ├── NumberInput.tsx
    ├── HelpTooltip.tsx
    ├── AssetAllocationEditor.tsx
    ├── ImportExportButtons.tsx
    ├── ResultsCards.tsx
    ├── ProjectionChart.tsx
    ├── WithdrawalComparison.tsx
    └── YearByYearTable.tsx
```

## Modelo de cálculo

Por cada año del horizonte y cada activo:
1. Aplica crecimiento mensual: `balance *= (1 + r)^(1/12)`
2. Suma la aportación mensual proporcional a la asignación
3. Al cierre del año, incrementa la aportación por el `contributionGrowth`

Métricas derivadas: valor nominal, valor presente (descontado por inflación), aportado, ganancia, % crecimiento del año, edad proyectada.

## Persistencia

`localStorage` bajo la clave `retirement-planner-state` con `{ version, inputs }`. La función `loadState` migra al esquema vigente cuando cambia `SCHEMA_VERSION`.

## Licencia

Uso personal. Sin garantías — herramienta informativa, no consejo financiero.
