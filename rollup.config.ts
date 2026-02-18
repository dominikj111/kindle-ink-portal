import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default defineConfig([
  {
    input: 'client/main.ts',
    output: {
      file: 'public/js/bundle.js',
      format: 'iife',
      name: 'PortalInk',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: 'tsconfig.client.json',
      }),
      terser({
        ecma: 3,
        ie8: true,
        compress: {
          ie8: true,
        },
        mangle: {
          ie8: true,
        },
      }),
    ],
  },
  {
    input: 'client/demo.ts',
    output: {
      file: 'public/js/demo.js',
      format: 'iife',
      name: 'PortalInkDemo',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: 'tsconfig.client.json',
      }),
      terser({
        ecma: 3,
        ie8: true,
        compress: {
          ie8: true,
        },
        mangle: {
          ie8: true,
        },
      }),
    ],
  },
  {
    input: 'client/pomodoro.ts',
    output: {
      file: 'public/js/pomodoro.js',
      format: 'iife',
      name: 'PortalInkPomodoro',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: 'tsconfig.client.json',
      }),
      terser({
        ecma: 3,
        ie8: true,
        compress: {
          ie8: true,
        },
        mangle: {
          ie8: true,
        },
      }),
    ],
  },
  {
    input: 'client/countdown.ts',
    output: {
      file: 'public/js/countdown.js',
      format: 'iife',
      name: 'PortalInkCountdown',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: 'tsconfig.client.json',
      }),
      terser({
        ecma: 3,
        ie8: true,
        compress: {
          ie8: true,
        },
        mangle: {
          ie8: true,
        },
      }),
    ],
  },
]);
