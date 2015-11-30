/*
 * Copyright 2013-2015 Intel Corporation.
 * 
 * See the file LICENSE for copying permission.
 */
var fs     = require('fs');
var _      = require('lodash');
var q      = require('q');
var moment = require('moment');

function DataFormater(data) {
    this.timestamp = moment();
    this.separateData(data);
}

DataFormater.prototype.separateData = function (data) {
    var compatibility = _.cloneDeep(data['compatibility-data']);
    this.css          = _.pick(compatibility, 'css');
    this.html         = _.pick(compatibility, 'html');
    this.media        = _.pick(compatibility, 'media');
    delete data['compatibility-data'];
    this.info = data;
};

DataFormater.prototype.saveData = function (type, data) {
    var filename = this.info.id + '~' + this.info.model + '~' + type;
    var timestamp = this.timestamp.format('MM-DD-YYYY HH:mm:ss');
    console.log(timestamp);
    var path = 'public/data/' + filename + '~' + timestamp + '.json';
    fs.writeFile(path, JSON.stringify(data), function(err) {
        if (err) { throw err; }
        else { console.log(filename + ' saved.'); }
    });
}

DataFormater.prototype.formatCss = function () {

};

DataFormater.prototype.formatHtml = function () {
    var htmlData = _.cloneDeep(this.info);
    var htmlCompatibility = this.html.html;
    var compatibility = {};
    var htmlTags = JSON.parse(fs.readFileSync('public/config/htmlTags.json'));
    _.forEach(htmlTags.tags, function (tag) {
        compatibility[tag] = {};
        (!!htmlCompatibility[tag]) && (compatibility[tag]._supported = htmlCompatibility[tag].supported);
    });
    for (var tag in htmlTags.attributes) {
        (!compatibility[tag]) && (compatibility[tag] = {});
        _.forEach(htmlTags.attributes[tag], function (attr) {
            if (!!htmlCompatibility[tag + '_'+ attr]) {
                (!compatibility[tag][attr]) && (compatibility[tag][attr] = {});
                (compatibility[tag][attr]._supported = htmlCompatibility[tag + '_'+ attr].supported);
            }
        });
    }
    compatibility.input = {};
    _.forEach(htmlTags.input.attributes, function (attr) {
        (!compatibility.input[attr]) && (compatibility.input[attr] = {});
        if (!!htmlCompatibility['input_'+ attr]) {
            compatibility.input[attr]._supported = htmlCompatibility['input_'+ attr].supported;
        }
    });
    compatibility.input.type = {};
    _.forEach(htmlTags.input.type, function (attr) {
        (!compatibility.input.type[attr]) && (compatibility.input.type[attr] = {});
        if (!!htmlCompatibility['input_type_'+ attr]) {
            (compatibility.input.type[attr]._supported = htmlCompatibility['input_type_'+ attr].supported);
        }
    });
    var json = _.cloneDeep(this.info);
    json['compatibility-data'] = compatibility;
    this.saveData('html', json);
};

DataFormater.prototype.formatMedia = function () {
    var htmlData = _.cloneDeep(this.info);
    var mediaCompatibility = this.media.media;
    var compatibility = {};
    var media = JSON.parse(fs.readFileSync('public/config/media.json'));
    for (var type in media) {
        _.forEach(media[type], function (format) {
            if (!!mediaCompatibility[format]) {
                (!compatibility[type]) && (compatibility[type] = {});
                (!compatibility[type][format]) && (compatibility[type][format] = {});
                compatibility[type][format]._supported = mediaCompatibility[format].supported;
            }
        });
    }
    var json = _.cloneDeep(this.info);
    json['compatibility-data'] = compatibility;
    this.saveData('media', json);
};

// function formatCss(result) {
//     var data = result;
//     var tmpData = JSON.parse(JSON.stringify(data))["compatibility-data"];  //deep clone the posting data obj
//     var cssProperties = JSON.parse(fs.readFileSync('public/config/cssProperties.json'));
//     var cssRules = JSON.parse(fs.readFileSync('public/config/cssRules.json'));
//     // var cssSelectors = JSON.parse(fs.readFileSync('public/config/cssRules.json'));
//     var filename = data.id + '_' + data.model;
//     var timestamp = new Date().toLocaleString().replace(/\:/g, '-');
//     var path = 'public/data/' + filename + '-' + timestamp + '.json';

//     for (var prop in cssProperties) {
//         if (cssProperties[prop].knownValues) {
//             for (var i = 0, len = cssProperties[prop].knownValues.length; i < len; i++) {
//                 var value = cssProperties[prop].knownValues[i];
//                 (!data["compatibility-data"][prop]) && (data["compatibility-data"][prop] = {});
//                 try {
//                     if (!tmpData[prop + '_' + value]) {
//                         data["compatibility-data"][prop][value] = tmpData[value].supported;
//                         (data["compatibility-data"][value]) && (delete data["compatibility-data"][value]);
//                     } else {
//                         data["compatibility-data"][prop][value] = tmpData[prop + '_' + value].supported;
//                         (data["compatibility-data"][prop + '_' + value]) && (delete data["compatibility-data"][prop + '_' + value]);
//                     }
//                     if (cssProperties[prop].prefixs) {

//                         var values = cssProperties[prop].knownValues;
//                         var prefixs = cssProperties[prop].prefixs;
//                         var vender;

//                         for (vender = prefixs.length; vender--; ) {
//                             var prefixProp = prefixs[vender] + prop;
//                             if (!data["compatibility-data"][prefixProp]) {
//                                 data["compatibility-data"][prefixProp] = {};
//                             }

//                             if (tmpData[prefixProp]) {
//                                 (data["compatibility-data"][prefixProp].supported = tmpData[prefixProp].supported);
//                                 for (var v = 0; v < values.length; v++) {
//                                     var val = values[v];
//                                     data["compatibility-data"][prefixProp][val] = tmpData[prefixProp + '_' + val].supported;
//                                     (data["compatibility-data"][prefixProp + '_' + val]) && (delete data["compatibility-data"][prefixProp + '_' + val]);
//                                 }
//                             }
//                         }
//                     }
//                 } catch (err) {
//                     console.warn('The property value <%s> wasn\'t be tested. Nor it\'s invalid value.', value);
//                 }
//             }
//         }
//     }

//     for (var rule in cssRules) {
//         if (cssRules.hasOwnProperty(rule)) {
//             for (var item in cssRules[rule]) {
//                 if (cssRules[rule].hasOwnProperty(item)) {
//                     (!data['compatibility-data'][rule][item]) && (data['compatibility-data'][rule][item] = {});
//                     for (var r = cssRules[rule][item].length; r--;) {
//                         if (tmpData[rule + '_' + item + '_' + cssRules[rule][item][r]]) {
//                             data['compatibility-data'][rule][item][cssRules[rule][item][r]] = tmpData[rule + '_' + item + '_' + cssRules[rule][item][r]].supported;
//                             delete data["compatibility-data"][rule + '_' + item + '_' + cssRules[rule][item][r]];
//                         }
//                     }
//                 }
//             }
//         }
//     }

//     for (var compatibility in data["compatibility-data"]) {
//         if (JSON.stringify(data["compatibility-data"][compatibility]) === '{}') {
//             delete data["compatibility-data"][compatibility];
//         }
//     }

//     fs.writeFile(path, JSON.stringify(data), function(err) {
//         if (err) { throw err; }
//         else { console.log(filename + ' saved.'); }
//     });
// }

exports.update = function(req, res) {
    res.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
    var formater = new DataFormater(req.body);
    formater.formatHtml();
    formater.formatMedia();
    // format(req.body);
    res.end('true');
};

exports.download = function(req, res) {
    var filepath = 'public/' + req.path;
    res.download(filepath);
};