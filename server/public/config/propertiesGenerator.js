/*
 * Copyright 2013-2015 Intel Corporation.
 * 
 * See the file LICENSE for copying permission.
 */
var fs = require('fs');
var prefix = ['-webkit-', '-o-', '-ms-', '-moz-'];
var _ = require('underscore');

var valueDirCheck = function(valueObj) {  //extend property-dir to property-top,bottom,left.right
    for (var prop in valueObj) {
        if (/dir/.test(prop)) {
            var baseProp = prop.replace(/-dir/, '');
            valueObj[baseProp + '-top'] = valueObj[prop];
            valueObj[baseProp + '-bottom'] = valueObj[prop];
            valueObj[baseProp + '-left'] = valueObj[prop];
            valueObj[baseProp + '-right'] = valueObj[prop];
            delete valueObj[prop];
        }
    }
    return valueObj;
};

var prefixCheck = function(values, propItem) {  //added vendor prefix if needed
    if (/prefix-/.test(propItem)) {
        var property = propItem.replace(/prefix-/, '');
        for (var i = prefix.length; i--; ) {
            var prefixProperty = prefix[i] + property;
            values.push(prefixProperty);
        }
        values.push(property);
    } else {
        values.push(propItem);
    }
};

var propertyParser = function(propObj, json) {
    for (var i = propObj.length; i--; ) {
        var prop = propObj[i];
        if (/prefix-/.test(prop)) {
            prop = prop.replace(/prefix-/, '');
            json[prop] = {};
            json[prop].prefixes = prefix;
        } else {
            json[prop] = {};
        }
    }
};

var valueParser = function(valueObj) {
    var tmpJson = {};
    var prefixExp = /prefix-/;

    valueObj = valueDirCheck(valueObj);
    for (var prop in valueObj) {
        if (valueObj.hasOwnProperty(prop)) {
            tmpJson[prop] = {};
            var knownValues = [];
            for (var i = valueObj[prop].length; i--; ) {
                prefixCheck(knownValues, valueObj[prop][i]);
            }
            tmpJson[prop].knownValues = knownValues;
        }
    }

    //added preifxes: [] array to prefix-property obj;
    _.each(_.filter(_.keys(tmpJson), function(prop){ return prefixExp.test(prop); }), function(prop) {
        var obj = tmpJson[prop];
        var standardProp = prop.replace(prefixExp, '');
        tmpJson[standardProp] = obj;
        tmpJson[standardProp].prefixes = prefix;
        delete tmpJson[prop];
    });
    return tmpJson;
};

fs.readFile('baseCssProperites.json', function(err, data){
    if (err) { throw err; }
    var json = {};
    data = JSON.parse(data);
    for (var i in data) {
        if (data.hasOwnProperty(i)) {
            (i === 'values') && (json = valueParser(data[i]));
            (i === 'properties') && (propertyParser(data[i], json));
        }
    }
    json = JSON.stringify(json);
    fs.writeFile('cssProperties.json', json, function(err){
        if (err) { throw err; }
        console.log('Generation Complete.');
    });
});
