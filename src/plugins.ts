export const plugins = [];

export async function loadPlugins(): Promise<void> {
  const loaded = await Promise.all([
    import('@nestjs/cqrs').then(m => m.CqrsModule),
  ]);

  loaded.forEach(m => plugins.push(m));
}
