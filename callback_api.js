const raw_connect = require('./lib/connect').connect;
const CallbackModel = require('./lib/callback_model').CallbackModel;
const recovery = require('./lib/recovery');

// Supports three shapes:
// connect(url, options, callback)
// connect(url, callback)
// connect(callback)
function connect(url, options, cb) {
  if (typeof url === 'function') (cb = url), (url = false), (options = false);
  else if (typeof options === 'function') (cb = options), (options = false);

  const {connectionOptions, recovery: recoveryOptions} = recovery.splitConnectionOptions(options);
  if (recovery.recoveryEnabled(recoveryOptions)) {
    const openModel = function () {
      return new Promise((resolve, reject) => {
        raw_connect(url, connectionOptions, function (err, c) {
          if (err === null) resolve(new CallbackModel(c));
          else reject(err);
        });
      });
    };

    return recovery.connectWithRecoveryCallback(openModel, recoveryOptions, cb);
  }

  raw_connect(url, connectionOptions, function (err, c) {
    if (err === null) cb && cb(null, new CallbackModel(c));
    else cb && cb(err);
  });
}

module.exports.connect = connect;
module.exports.credentials = require('./lib/credentials');
module.exports.IllegalOperationError = require('./lib/error').IllegalOperationError;
