'use strict';

var path = require('path')
, basename = path.basename(path.dirname(__filename))
, debug = require('debug')('mill:contrib:' + basename)
, Transform = require("stream").Transform
, CSV = require('csv-string')
;

function Command(options)
{
  Transform.call(this, options);
  this.options = options || {}
  this.begin = true;
  this.separator = ',';
  this.buffer = '';
}

Command.prototype = Object.create(
  Transform.prototype, { constructor: { value: Command }});

Command.prototype._transform = function (chunk, encoding, done) {
  var that = this;

  that.buffer += chunk;

  if (that.begin) {
    that.begin = false;
    that.separator = CSV.detect(that.buffer);
    that.emit('begin');
  }

  var r, s = 0;

  while (r = CSV.read(that.buffer.slice(s), this.separator, function (row) {
        var str = CSV.stringify(row);
        if (str.trim() !== '') {
          that.push(str);
        }
      }
    )
  ) {
    s += r;
  }
  that.buffer = that.buffer.slice(s);
}
Command.prototype.end = function () {
  var that = this;
  that.emit('end');
};

module.exports = function (options, si) {
  var cmd = new Command(options);
  return si.pipe(cmd);
}
