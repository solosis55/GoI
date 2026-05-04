import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // La regla recomendada prohíbe setState en efectos; nuestro patrón (carga con useEffect, reset al desloguear) es válido.
      'react-hooks/set-state-in-effect': 'off',
      // Exportamos hooks, contexto y utilidades junto a componentes (Vite HMR sigue siendo util en la práctica).
      'react-refresh/only-export-components': 'off',
    },
  },
])
