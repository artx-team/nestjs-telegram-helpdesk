export const modules = [];

export async function importModules(): Promise<void> {
  const loaded = await Promise.all([
    import('./some-module.js'),
  ]);

  loaded.forEach(m => modules.push(m));
}
