import { FlatCompat } from '@eslint/eslintrc';
import baseConfig from '@template/eslint-config';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [...baseConfig, ...compat.extends('next/core-web-vitals')];
