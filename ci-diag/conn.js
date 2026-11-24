'use strict';
const oracledb = require('oracledb');
(async () => {
  const cs = `//${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_DATABASE}`;
  for (const host of ['localhost', '127.0.0.1']) {
    const c = `//${host}:${process.env.ORACLE_PORT}/${process.env.ORACLE_DATABASE}`;
    for (let i = 0; i < 3; i++) {
      let t = Date.now();
      const conn = await oracledb.getConnection({user: process.env.ORACLE_USER, password: process.env.ORACLE_PASSWORD, connectString: c});
      const tc = Date.now() - t; t = Date.now();
      await conn.execute('select 1 from dual');
      const tq = Date.now() - t; t = Date.now();
      await conn.close();
      console.log(`${c} connect=${tc}ms query=${tq}ms close=${Date.now() - t}ms`);
    }
  }
  console.log('unused', cs);
})().catch(e => { console.error(e); process.exit(1); });
