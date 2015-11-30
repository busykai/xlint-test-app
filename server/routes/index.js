/*
 * Copyright 2013-2015 Intel Corporation.
 * 
 * See the file LICENSE for copying permission.
 */
var fs = require('fs');
var _ = require('lodash');
var moment = require('moment');

exports.index = function(req, res) {

    fs.readdir('public/data/', function(err, files) {
        var len = files.length;
        var dataObj = {};
        _.forEach(files, function (file) {
            var fileItems = file.split('~');
            var time = fileItems[3].slice(0, -5);
            (!dataObj[time]) && (dataObj[time] = {}, dataObj[time].past = moment(time).fromNow(), dataObj[time].timestamp = time, dataObj[time].platform = fileItems[0], dataObj[time].model = fileItems[1]);
            (!dataObj[time].datas) && (dataObj[time].datas = {});
            dataObj[time].datas[fileItems[2]] = {
                link: file,
                title: fileItems[2]
            };
        });
        dataObj = _.values(dataObj);
        res.render('index', {title: 'X-Lint Server', data: dataObj, config: 'cssProperties.json'});
    });

};