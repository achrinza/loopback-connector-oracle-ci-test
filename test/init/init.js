// Copyright IBM Corp. 2013,2019. All Rights Reserved.
// Node module: loopback-connector-oracle
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const juggler = require('loopback-datasource-juggler');
let DataSource = juggler.DataSource;

const config = require('rc')('loopback', {test: {oracle: {}}}).test.oracle;
config.maxConn = 64;

let db;
// Every DataSource handed out by getDataSource(). Test files keep their own
// references (often captured while mocha loads the files), and a reference
// to a DataSource that resetDataSourceClass() already disconnected will
// silently reconnect on its next query. Track them all so that the root
// `after` hook below can close every pool; an open pool keeps the Node.js
// event loop alive and mocha would never exit.
const dataSources = new Set();

global.getDataSource = global.getSchema = function() {
  if (db) {
    return db;
  }
  db = new DataSource(require('../../'), config);
  dataSources.add(db);
  db.log = function(a) {
    // console.log(a);
  };
  return db;
};

global.resetDataSourceClass = function(ctor) {
  DataSource = ctor || juggler.DataSource;
  const promise = db ? db.disconnect() : Promise.resolve();
  db = undefined;
  return promise;
};

global.connectorCapabilities = {
  ilike: false,
  nilike: false,
};

after(function(done) {
  const all = Array.from(dataSources);
  dataSources.clear();
  let pending = all.length;
  if (!pending) return done();
  all.forEach(function(ds) {
    ds.disconnect(function() {
      if (--pending === 0) done();
    });
  });
});
