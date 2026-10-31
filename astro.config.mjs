import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://jichangyouxuan.blog',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  devToolbar: { enabled: false },
});
