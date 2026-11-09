// SPDX-License-Identifier: GPL-3.0-only
(function startMyspoti() {
  let attempts = 0;
  const wait = setInterval(() => {
    if (++attempts > 120) { clearInterval(wait); return; }
    if (!globalThis.Spicetify?.Player || !globalThis.MyspotiDesktopCore || !Spicetify.Platform?.History?.push || !Spicetify.Menu?.Item) return;
    clearInterval(wait);
    if (globalThis.MyspotiDesktopRuntime) return;
    const adapter = new MyspotiDesktopCore.Adapter(Spicetify);
    const timer = new MyspotiDesktopCore.SleepTimer(async () => {
      if (adapter.snapshot().playing) await adapter.command('pause');
    });
    const interval = setInterval(() => void timer.tick(), 1000);
    let menu;
    if (Spicetify.Menu?.Item && Spicetify.Platform?.History?.push) {
      menu = new Spicetify.Menu.Item('Myspoti', false, () => Spicetify.Platform.History.push('/myspoti-desktop'));
      menu.register();
    }
    // This installation is the user's Myspoti entry point. Open it once per
    // client start; normal navigation remains available afterwards.
    Spicetify.Platform.History.push('/myspoti-desktop');
    globalThis.MyspotiDesktopRuntime = { adapter, timer, dispose() { clearInterval(interval); timer.cancel(); menu?.deregister(); delete globalThis.MyspotiDesktopRuntime; } };
  }, 250);
})();
