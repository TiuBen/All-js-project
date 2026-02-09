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
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // ========== 严格禁止 any ==========
      '@typescript-eslint/no-explicit-any': 'error', // 完全禁止使用 any
      
      // ========== 相关类型检查规则 ==========
      '@typescript-eslint/no-unsafe-argument': 'error', // 禁止 any 类型的参数
      '@typescript-eslint/no-unsafe-assignment': 'error', // 禁止 any 类型的赋值
      '@typescript-eslint/no-unsafe-call': 'error', // 禁止 any 类型的函数调用
      '@typescript-eslint/no-unsafe-member-access': 'error', // 禁止 any 类型的成员访问
      '@typescript-eslint/no-unsafe-return': 'error', // 禁止返回 any 类型
      
      // ========== 建议用 unknown 代替 any ==========
      '@typescript-eslint/no-explicit-any': ['error', {
        fixToUnknown: true, // 建议用 unknown 代替 any
        ignoreRestArgs: false, // 是否允许 rest 参数使用 any
      }],
    },
  },
])
