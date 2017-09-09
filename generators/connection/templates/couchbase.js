const couchbaseClient = require('couchbase');
//TODO: Implament Reconnect after Cluster fail for development
class Couchbase {
  constructor(options = {}) {

    this.couchbase = options.couchbase || couchbaseClient;

    if (!options.cluster) {
      this.cluster = new couchbaseClient.Cluster('couchbase://127.0.0.1');
    } else {
      if (typeof options.cluster === 'string') {
        this.cluster = new couchbaseClient.Cluster(options.cluster);
      } else {
        this.cluster = options.cluster;
      }
    }
    if (!this.cluster) {
      this.cluster = couchbaseClient.Cluster('couchbase://127.0.0.1');
    }
    debug('peep-master-api::services::couchbase')(options, couchbaseClient.Cluster('couchbase://127.0.0.1'));
    if (options.bucket) {
      if (typeof options.bucket === 'string') {
        this.bucket = this.cluster.openBucket(options.bucket);
      } else {
        this.bucket = options.bucket;
      }
    } else {
      this.bucket = this.cluster.openBucket('default');
    }
    // tryOpenBucket();
  }
  tryOpenBucket() {
    return new Promise((resolve,reject) => {
      this.bucket = this.cluster.openBucket('default');
      this.bucket.on('error', (err)=> {
        this.couchbaseConnected = false;
        debug('CONNECT ERROR:', err);
        reject(err);
      });

      this.bucket.on('connect', () => {
        this.couchbaseConnected = true;
        debug('connected couchbase');
        resolve(true);
      });
    });

    /*
    tryOpenBucket();
    const couchbaseConnected = false;

    if (couchbaseConnected) {
      return QueryPromise;
    } else {
       // We try and open bucket again here. If its successful, couchbaseConnected will bet set to true and next time data will be fetched from couchbase
      return tryOpenBucket().then(QueryPromise);
       // Get data from persistent store, mysql
    }
    */

  }
}



module.exports = function () {
  const app = this;
  const config = app.get('couchbase');

  app.set('couchbaseClient', new Couchbase(config));
};
