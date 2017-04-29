const { app, Tray } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const { resolve: resolvePath } = require('path');
const sudo = require('sudo-prompt');
const psList = require('ps-list');
const log = require('electron-log');

// Fix for nginx being installed with brew
process.env.PATH += ':/usr/local/bin';

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

          for (let i = 0; i < processes.length; i += 1) {
            process = processes[i].name;
            if (
              !/.*?nginx-indicator.*?/.test(process) &&
              /.*?nginx.*?/.test(process)
            ) {
              running = true;
              break;
            }
          }

          tray.setImage(running ? ACTIVE : INACTIVE);
        } // eslint-disable-line comma-dangle
      );
    },
    1000 // eslint-disable-line comma-dangle
  );
});

// Don't show in the macOS dock
if ('dock' in app) app.dock.hide();
