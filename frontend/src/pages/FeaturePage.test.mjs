import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

// Exercise real route guards and FeaturePage selection without API polling,
// browser storage, or loading unrelated page trees during server rendering.
const stateId = '\0menu-regression:state';
const server = await createServer({
  root: fileURLToPath(new URL('../../', import.meta.url)),
  configFile: false,
  ssr: { noExternal: ['react-router-dom'] },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, hmr: false, watch: null },
  plugins: [{
    name: 'menu-regression-fixtures',
    enforce: 'pre',
    resolveId(source) {
      if (source === 'virtual:menu-test-state') return stateId;
      if (source === 'react-router-dom') return '\0menu-regression:router';
      const context = source.match(/context\/(Auth|Language|Platform)Context$/);
      if (context) return `\0menu-regression:${context[1]}`;
      const component = source.match(/components\/modern\/(AppLayout|Network|Messages)$/);
      if (component) return `\0menu-regression:${component[1]}`;
      const page = source.match(/pages\/(LoginPage|RegisterPage|HomePage|LandingPage)$/);
      if (page) return `\0menu-regression:${page[1]}`;
    },
    load(id) {
      if (!id.startsWith('\0menu-regression:')) return;
      const name = id.slice('\0menu-regression:'.length);
      const stateImport = "import { state } from 'virtual:menu-test-state';";
      const reactImport = "import { createElement } from 'react';";
      if (name === 'state') return "export const state = { path: '/network', language: 'id', user: { id: 1, name: 'Test user', role: 'admin' } };";
      if (name === 'router') return `${reactImport}${stateImport}
        import { MemoryRouter } from 'react-router';
        export * from 'react-router';
        export const BrowserRouter = ({children}) => createElement(MemoryRouter, {initialEntries:[state.path]}, children);`;
      if (name === 'Auth') return `${stateImport}export const useAuth = () => ({ user:state.user, isAuthenticated:Boolean(state.user), loading:false });`;
      if (name === 'Platform') return 'export const usePlatform = () => ({ uploadLimitsEnabled:false });';
      if (name === 'Language') return `${stateImport}
        import dictionary from '/src/i18n/translations.json';
        import { translate } from '/src/i18n/language.js';
        export const useLanguage = () => ({language:state.language,t:text=>translate(text,state.language,dictionary)});`;
      if (name === 'AppLayout') return `${reactImport}export default function Layout({currentTab,children}) {return createElement('main', {'data-page':currentTab}, children);}`;
      if (name === 'Network' || name === 'Messages') return `${reactImport}export default function Content() {return createElement('h1', {'data-feature':'${name.toLowerCase()}'}, '${name} content');}`;
      if (name.endsWith('Page')) return `${reactImport}export default function Page() {return createElement('h1', null, '${name}');}`;
    },
  }, react()],
});
after(() => server.close());
const { state } = await server.ssrLoadModule('virtual:menu-test-state');
const { default: AppRouter } = await server.ssrLoadModule('/src/routes/AppRouter.jsx');

function renderRoute() {
  return new Promise((resolve, reject) => {
    let html = '';
    const output = new Writable({write(chunk, encoding, done) { html += chunk.toString(); done(); }});
    output.on('finish', () => resolve(html));
    output.on('error', reject);
    const stream = renderToPipeableStream(createElement(AppRouter), {
      onAllReady() { stream.pipe(output); },
      onError: reject,
    });
  });
}

for (const language of ['id', 'en']) {
  for (const page of ['network', 'messages', 'analytics']) {
    test(`${page} renders its content and stable menu identity in ${language}`, async () => {
      state.path = `/${page}`;
      state.language = language;
      const html = await renderRoute();
      assert.ok(html.includes(`data-page="${page}"`), html);
      if (page === 'analytics') assert.match(html, /coming soon|segera hadir/i);
      else assert.ok(html.includes(`data-feature="${page}"`), html);
    });
  }
}
