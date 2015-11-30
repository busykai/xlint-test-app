/*
 * Copyright 2013-2015 Intel Corporation.
 * 
 * See the file LICENSE for copying permission.
 */
var fs = require('fs');
var _ = require('underscore');

var diff = function () {
  var file = JSON.parse(fs.readFileSync('data/Android_2.3.3_X10i.json'))['compatibility-data'];
  var compareFile = JSON.parse(fs.readFileSync('data/Mobile Safari_4_Android.json'))['compatibility-data'];
  console.log(_.isEqual(file, compareFile));
}

diff();