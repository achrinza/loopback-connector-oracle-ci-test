'use strict';
/* eslint-disable no-console */
const oracledb = require('oracledb');
const DataSource = require('loopback-datasource-juggler').DataSource;
const env = process.env;
const sleep = ms => new Promise(r => setTimeout(r, ms));
function sockets(label) {
  const s = process._getActiveHandles()
    .filter(h => h && h.constructor && h.constructor.name === 'Socket' &&
      h.remotePort)
    .map(h => `${h.remoteAddress}:${h.remotePort}`);
  console.log(label, 'open sockets:', s.length, s.join(' '));
}
(async () => {
  const host = process.argv[2] || 'localhost';
  const cs = `//${host}:${env.ORACLE_PORT}/${env.ORACLE_DATABASE}`;
  const pool = await oracledb.createPool({
    user: env.ORACLE_USER, password: env.ORACLE_PASSWORD,
    connectString: cs, poolMin: 1, poolMax: 4,
  });
  const c = await pool.getConnection();
  await c.execute('select 1 from dual');
  await c.close();
  sockets(`[${host}] raw pool before close`);
  await pool.close();
  await sleep(2000);
  sockets(`[${host}] raw pool after close`);

  const ds = new DataSource(require('..'), {
    host, port: env.ORACLE_PORT, database: env.ORACLE_DATABASE,
    user: env.ORACLE_USER, password: env.ORACLE_PASSWORD,
  });
  await new Promise((res, rej) => ds.connect(e => e ? rej(e) : res()));
  await new Promise((res, rej) => ds.ping(e => e ? rej(e) : res()));
  console.log(`[${host}] ds.connected=${ds.connected} ` +
    `pool=${!!ds.connector.pool}`);
  sockets(`[${host}] datasource before disconnect`);
  await new Promise(res => ds.disconnect(res));
  console.log(`[${host}] after disconnect pool=${!!ds.connector.pool}`);
  await sleep(2000);
  sockets(`[${host}] datasource after disconnect`);
})().catch(e => { console.error(e); process.exit(1); });
