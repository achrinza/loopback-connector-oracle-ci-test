'use strict';
const oracledb = require('oracledb');
const env = process.env;
(async () => {
  for (const host of ['localhost', '127.0.0.1']) {
    const c = `//${host}:${env.ORACLE_PORT}/${env.ORACLE_DATABASE}`;
    for (let i = 0; i < 3; i++) {
      let t = Date.now();
      const conn = await oracledb.getConnection({
        user: env.ORACLE_USER,
        password: env.ORACLE_PASSWORD,
        connectString: c,
      });
      const tc = Date.now() - t;
      t = Date.now();
      await conn.execute('select 1 from dual');
      const tq = Date.now() - t;
      t = Date.now();
      await conn.close();
      console.log(`${c} connect=${tc}ms query=${tq}ms ` +
        `close=${Date.now() - t}ms`);
    }
  }
})().catch(e => { console.error(e); process.exit(1); });
