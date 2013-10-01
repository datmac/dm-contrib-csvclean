'use strict';
var  path = require('path')
, basename = path.basename(path.dirname(__filename))
, util = require('util')
, should = require('should')
, tester = require('dm-core').tester
, command = require('./index.js')
;


describe(basename, function () {

    describe('#1', function () {
        it('should be normalized', function (done) {
            tester(command, {})
            .send("a|b|c\nd|e|f\ng|h|i\n")
            .end(function (err, res) {
                res.should.equal("a,b,c\r\nd,e,f\r\ng,h,i\r\n");
                done();
              }
            );
          }
        )
      }
    )
  }
);

