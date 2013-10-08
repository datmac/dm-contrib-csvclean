'use strict';

var path = require('path')
, basename = path.basename(path.dirname(__filename))
, debug = require('debug')('dm:contrib:' + basename)
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

Command.prototype.parse = function (rows) {
  var self = this;
  self.push(rows.map(function (row) {
      return CSV.stringify(row);
    }
  ).join(''));
}
Command.prototype._transform = function (chunk, encoding, done) {
  var self = this;

  if (self.begin) {
    self.begin = false;
    self.separator = CSV.detect(chunk.toString());
    self.emit('begin');
  }
  self.buffer = self.buffer.concat(chunk.toString());
  var x = CSV.readChunk(self.buffer, self.separator, function (rows) {
      self.parse(rows);
    }
  );
  done();
  self.buffer = self.buffer.slice(x);
}
Command.prototype.end = function () {
  var self = this;

  CSV.readAll(self.buffer, self.separator, function (rows) {
      self.parse(rows);
    }
  );
  self.emit('end');
};


module.exports = function (options, si) {
  var cmd = new Command(options);
  return si.pipe(cmd);
}
