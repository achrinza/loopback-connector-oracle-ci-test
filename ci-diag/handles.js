'use strict';
/* eslint-disable no-console */
const Oracle = require('../lib/oracle').Oracle;
const connectors = new Map();
let currentTest = '(load)';
beforeEach(function() {
  currentTest = this.currentTest.fullTitle();
});
const connect = Oracle.prototype.connect;
Oracle.prototype.connect = function() {
  if (!this.pool && !this._pendingConnectCallbacks) {
    const list = connectors.get(this) || [];
    list.push(currentTest + '\n' +
      new Error().stack.split('\n').slice(2, 9).join('\n'));
    connectors.set(this, list);
  }
  return connect.apply(this, arguments);
};
after(function() {
  setTimeout(function() {
    console.log('CONNECTORS', connectors.size);
    for (const [c, list] of connectors) {
      if (c.pool) {
        console.log('UNCLOSED POOL open=' + c.pool.connectionsOpen +
          ' inUse=' + c.pool.connectionsInUse +
          ' ds.connected=' + (c.dataSource && c.dataSource.connected));
        console.log(list.join('\n---\n'));
      }
    }
    console.log('ACTIVE RESOURCES', process.getActiveResourcesInfo());
  }, 3000).unref();
});
