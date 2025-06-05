import { pathToFileURL } from 'url';
import path from 'path';

export async function resolve(specifier, context, defaultResolve) {
  const { parentURL } = context;

  const match = specifier.match(/^\.\/(\w+)(\.js)?$/);
  const isFromWebhook = parentURL?.includes('/packages/github-sync/github-webhook/');

  if (match && isFromWebhook) {
    const file = match[1];

    // Absolute path to the project root (one level above dev-server/)
    const projectRoot = path.resolve(new URL('.', import.meta.url).pathname, '..');
    const redirected = pathToFileURL(path.join(projectRoot, 'lib', `${file}.js`)).href;

    console.log(`[loader] Redirecting ${specifier} → lib/${file}.js`);

    return {
      url: redirected,
      shortCircuit: true
    };
  }

  return defaultResolve(specifier, context, defaultResolve);
}
