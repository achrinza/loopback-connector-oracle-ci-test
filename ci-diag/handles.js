'use strict';
/* eslint-disable no-console */
after(function() {
  setTimeout(function() {
    console.log('ACTIVE RESOURCES', process.getActiveResourcesInfo());
    for (const h of process._getActiveHandles()) {
      const name = h && h.constructor && h.constructor.name;
      if (name === 'Socket') {
        console.log('SOCKET', h.remoteAddress, h.remotePort,
          h.localPort, 'destroyed=' + h.destroyed);
      } else if (name === 'Timeout') {
        console.log('TIMER', h._idleTimeout,
          String(h._onTimeout).slice(0, 300));
      } else {
        console.log('HANDLE', name);
      }
    }
  }, 5000).unref();
});
