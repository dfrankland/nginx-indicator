var AutoLaunch = require('auto-launch');
const { app, Tray } = require('electron');
const { resolve: resolvePath } = require('path');
const sudo = require('sudo-prompt');
const psList = require('ps-list');
const log = require('electron-log');

// Fix for nginx being installed with brew
process.env.PATH = process.env.PATH + ':/usr/local/bin';

// Try to always auto-launch app
const autoLaunch = new AutoLaunch({ name: 'nginx-indicator' });
autoLaunch.isEnabled().then(
  isEnabled => {
    if (isEnabled) return;
    autoLaunch.enable();
  }
);

// Active / Inactive Nginx "G" logos
const ACTIVE = resolvePath(__dirname, 'nginx-active.png');
const INACTIVE = resolvePath(__dirname, 'nginx-inactive.png');

// Starts `nginx` process on macOS
const tryToTurnOnNginx = () =>
  sudo.exec('nginx', { name: 'Nginx Indicator' }, (error, stdout, stderr) => {
    log.info(stdout);
    log.warn(stderr);
    log.error(error);
  });

app.on('ready', () => {
  const tray = new Tray(INACTIVE);
  tray.on('click', tryToTurnOnNginx);

  setInterval(
    () => {
      psList().then(
        processes => {
          let process;
          let running = false;

          for (let i = 0; i < processes.length; i++) {
            process = processes[i].name;
            if (/.*?nginx-indicator.*?/.test(process)) continue;
            if (/.*?nginx.*?/.test(process)) {
              running = true;
              break;
            }
          }

          tray.setImage(running ? ACTIVE : INACTIVE);
        }
      );;
    }, 1000
  );
});

// Don't show in the macOS dock
if ('dock' in app) app.dock.hide();
