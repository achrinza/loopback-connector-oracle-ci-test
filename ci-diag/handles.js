'use strict';
/* eslint-disable no-console */
const oracledb = require('oracledb');
const pools = [];
let currentTest = '(none)';
beforeEach(function() {
  currentTest = this.currentTest.fullTitle();
});
const createPool = oracledb.createPool;
oracledb.createPool = function(cfg, cb) {
  const rec = {test: currentTest, stack: new Error().stack, closed: false};
  pools.push(rec);
  return createPool.call(this, cfg, function(err, pool) {
    if (pool) {
      rec.pool = pool;
      const close = pool.close;
      pool.close = pool.terminate = function() {
        rec.closed = true;
        return close.apply(this, arguments);
      };
    }
    cb(err, pool);
  });
};
after(function() {
  setTimeout(function() {
    console.log('POOLS created', pools.length);
    for (const p of pools) {
      if (p.pool && !p.closed) {
        console.log('UNCLOSED POOL from test:', p.test,
          'open=', p.pool.connectionsOpen, 'inUse=', p.pool.connectionsInUse);
        console.log(p.stack.split('\n').slice(1, 14).join('\n'));
      }
    }
    console.log('ACTIVE RESOURCES', process.getActiveResourcesInfo());
  }, 3000).unref();
});
