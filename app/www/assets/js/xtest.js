/*
 * Copyright 2013-2015 Intel Corporation.
 * 
 * See the file LICENSE for copying permission.
 */

/**
 * @fileOverview Test library for test app.
 * @author Junxi(junxi.lu@intel.com)
 * @version 0.0.0
 * @copyright INTEL SSG DPD MCC XDK2Dev
 */

'use strict';

var xTest = (function($, window) {
    var xTest = {};

    xTest.venderInfo = (function(){
        var styles = window.getComputedStyle(document.documentElement, '');
        var pre = Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms|o)-/);
        return {
            low: pre[1],
            css: pre[0],
            upp: pre[1][0].toUpperCase() + pre[1].substr(1)
        };
    }());

    window.data["compatibility-data"] = {};
    window.data["compatibility-data"].css = {};
    window.data["compatibility-data"].html = {};
    window.data["compatibility-data"].media = {};
    window.data["user-agent"] = navigator.userAgent;
    window.data.prefix = xTest.venderInfo.css;

    xTest.setRuntimeInfo = function() {
        if (window.device) {
            window.data.platform = window.device.platform;
            window.data.version = window.device.version;
            window.data.model = window.device.model;
        } else {
            window.data.platform = $.ua.browser.name;
            window.data.version = $.ua.browser.major;
            window.data.id = window.data.platform + '_' + window.data.version;
            window.data.model = $.ua.os.name;
        }
        window.data.id = window.data.platform + '_' + window.data.version;
    };

      /**
       * @description Data Object
       *
       * @type {Object}
       */
    xTest.data = window.data;

    /**
    * @description Set the compatibility of css
    *
    * @example
    * // if both border-image and -webkit-border-image are supported
    * xTest.setCssCompatibility('borderImage');
    * @example
    * // if none format of border-image are supported
    * xTest.setCssCompatibility('borderImage', 'none');
    * @example
    * // if only -webkit-border-image is supported
    * xTest.setCssCompatibility('borderImage', 'prefix');
    * @example
    * // if only border-image is supported
    * xTest.setCssCompatibility('borderImage', 'standard');
    * @example
    * // if currentColor is supported or not
    * // (set the compatibility straight forward if there isn't a prefix format)
    * xTest.setCssCompatibility('currentColor', 'y||n');
    */
    xTest.setCssCompatibility = function(feature, undefined) {
        var $el = $('#' + feature);
        var prefix = window.data.prefix;
        var type = arguments[1];

        if (arguments.length === 1 || type === 'all') {
            this.setCompatibilityData('css', feature, 'y').setCompatibilityData('css', prefix + feature, 'y');
            $el.find('.standard-test').removeClass('fail').addClass('pass');
            $el.find('.vender-prefix-test').removeClass('fail').addClass('pass');
            return;
        }

        switch (type) {
            case 'none':
                this.setCompatibilityData('css', feature, 'n').setCompatibilityData('css', prefix + feature, 'n');
                break;
            case 'prefix':
                this.setCompatibilityData('css', feature, 'n').setCompatibilityData('css', prefix + feature, 'y');
                $el.find('.vender-prefix-test').removeClass('fail').addClass('pass');
                break;
            case 'standard':
                this.setCompatibilityData('css', feature, 'y').setCompatibilityData('css', prefix + feature, 'n');
                $el.find('.standard-test').removeClass('fail').addClass('pass');
                break;
            default:
                this.setCompatibilityData('css', feature, type);
                var prefixExp = new RegExp(prefix, 'i');
                if (prefixExp.test(feature) && type === 'y') {
                    var prefixTest = '#' + feature.replace(prefix, 'prefix-') + '-test';
                    var $prefixTest = $(prefixTest);
                    $prefixTest.parent('.vender-prefix-test').removeClass('fail').addClass('pass');
                }
                (type === 'y') && ( $el.find('.standard-test').removeClass('fail').addClass('pass') );
        }
    };

    /**
    * @description Write the data to json
    * @param {String} feature
    * @param {String} compatibility
    *
    * @todo modified for special css like currentColor which are't tranditional name-name format
    */
    xTest.setCompatibilityData = function(type, feature, compatibility) {
        (!compatibility) && (compatibility = 'y');
        (/[A-Z]/.test(feature)) && (feature = feature.toCssFormat());
        this.data["compatibility-data"][type][feature] = JSON.parse('{"supported":"' + compatibility + '"}');
        return this;
    };

    xTest.html = {};

    xTest.html.inputType = function (id) {
        var type = 'input_type_' + id;
        if (Modernizr.inputtypes[id]) {
            id = '#' + type;
            $(id).find('.standard-test').removeClass('fail').addClass('pass');
            xTest.setCompatibilityData('html', type);
        } else {
            xTest.setCompatibilityData('html', type, 'n');
        }
    };

    xTest.html.newTag = function (tag, prop) {
        var id = tag;
        if (arguments.length === 1) {
            var newArg = tag.split('_');
            var prop = newArg[1];
            tag = newArg[0];
        }
        if (prop in document.createElement(tag)) {
            $('#' + id).find('.standard-test').removeClass('fail').addClass('pass');
            xTest.setCompatibilityData('html', id);
        } else {
            xTest.setCompatibilityData('html', id, 'n');
        }
    };

    xTest.html.newElement = function (el) {
        var $el = $('<' + el + '>');
        $el.appendTo('html');
        var display = $el.css('display');
        if (display === 'block') {
            $('#' + el).find('.standard-test').removeClass('fail').addClass('pass');
            xTest.setCompatibilityData('html', el);
        } else {
            xTest.setCompatibilityData('html', el, 'n');
        }
    };

    xTest.media = {};

    xTest.media.mediaTag = {
        video: document.createElement('video'),
        audio: document.createElement('audio')
    };

    xTest.media.mediaType = function (id) {
        var type = id.replace(/\_/, '/');
        var format = id.slice(0, 5);
        var el = this.mediaTag[format];
        var supported = el.canPlayType(type);
        console.log(type, supported);
        if (supported === 'maybe') {
            $('#' + id).find('.standard-test').removeClass('fail').addClass('pass').html(supported);
            xTest.setCompatibilityData('media', type, supported);
        } else {
            xTest.setCompatibilityData('media', type, 'n');
        }
    };

    xTest.css = {};

    xTest.css.domStyle = function(id) {

        function _styleSupporting(prop) {
            var venderPrefix = (xTest.venderInfo.upp === 'Moz' && xTest.venderInfo.upp) || xTest.venderInfo.low;
            var props = [];
            var testDom = document.createElement('a');
            var support = [];

            props.push(prop);
            props.push(venderPrefix + prop.toInitUpper());

            for (var i = 0; i < props.length; i++) {
                if (props[i] in testDom.style) {
                    support.push(props[i]);
                }
            }
            return support;
        }

        var support = _styleSupporting(id);
        var $el = $('#' + id);
        var supportNum = support.length;
        var prefixExp = new RegExp(xTest.venderInfo.low, 'i');
        var onlyStandard = !$el.find('.vender-prefix-test').length;

        if (!supportNum) {
            if (onlyStandard) {
                xTest.setCssCompatibility(id, 'n');
                return;
            }
            xTest.setCssCompatibility(id, 'none');
            return;
        }

        if (supportNum === 1) {
            if (prefixExp.test(support[0])) {
                xTest.setCssCompatibility(id, 'prefix');
            } else {
                if (onlyStandard) {
                    xTest.setCssCompatibility(id, 'y');
                } else {
                    xTest.setCssCompatibility(id, 'standard');
                }
            }
            return;
        }

        xTest.setCssCompatibility(id);
    };

    /**
    * @description [description]
    * @param  {String} id Id/Feature/Value name.
    * @param  {Object} cssObj
    */
    xTest.css.assignment = function(id, cssObj) {

        // @type {Boolean} Judge if there are a prefix format for the property or not.
        var onlyStandard = !$('#' + id).find('.vender-prefix-test').length;
        var $standardTest = $('#' + id + '-test');
        var property = cssObj.property || id.toCssFormat();
        var value = cssObj.value;
        var reference = cssObj.reference || value;
        var prefixProp = false;


        function _setGetTest($el, property, value, reference) {
            $el.css(property, value);

            var referenceExp;
            var getValue = $el.css(property);
            var valueExp = new RegExp(reference, 'i');
            var propertyExp = new RegExp(property);
            var support = false;

            //when the reference value isn't unique, like 'color: transparent' will be transparent or rgba(0, 0, 0, 0)
            if (typeof reference !== 'object') {
                referenceExp = new RegExp(reference, 'i');
                support = valueExp.test(getValue) || propertyExp.test(getValue) || referenceExp.test(getValue);
            } else {
                for (var i = reference.length; i--; ) {
                    referenceExp = new RegExp(reference[i], 'i');
                    support = support || valueExp.test(getValue) || propertyExp.test(getValue) || referenceExp.test(getValue);
                }
            }
            if (support) {
                xTest.setCssCompatibility(id, 'y');
            } else {
                xTest.setCssCompatibility(id, 'n');
            }
        }

        (/prefix-/.test(property)) && (property = property.replace(/prefix-/, ''), prefixProp = true);
        _setGetTest($standardTest, property, value, reference);

        if (onlyStandard) { return; }

        var $prefixTest = $('#prefix-' + id + '-test');
        id = xTest.data.prefix + id;

        if (prefixProp) {
            property = xTest.data.prefix + property;
            _setGetTest($prefixTest, property, value, reference);
            return;
        }

        value = cssObj.prefixValue || value;
        reference = cssObj.reference || value;
        (typeof reference !== 'object') && ( reference = reference.split('|') );
        value = xTest.data.prefix + value;
        reference.push(value);

        _setGetTest($prefixTest, property, value, reference);
    };

    /**
    * @description Units value assigment test.
    * @param  {String} id Id/Feature/Value name.
    * @param  {String} value The value of the units. Default is 8.
    */
    xTest.css.units = function(id, value) {

        function _judgeWidth() {
            $el.css('width', 0).css('width', value);
            var val = $el.width();
            if (!!val) {
                xTest.setCssCompatibility(id, 'y');
            } else {
                xTest.setCssCompatibility(id, 'n');
            }
        }

        var onlyStandard = !$('#' + id).find('.vender-prefix-test').length;
        var $el = $('#' + id + '-test');
        value = value || 8 + id;

        _judgeWidth();

        (!onlyStandard) && ( $el = $('#prefix-' + id + '-test'), id = xTest.data.prefix + id, _judgeWidth() );
    };

    String.prototype.toCssFormat = function() {
        return this.replace(/([A-Z])/g, function($1) {
            return "-" + $1.toLowerCase();
        });
    };

    String.prototype.toInitUpper = function() {
        return this.replace(/\b\w+\b/g, function(word){
            return word.substring(0,1).toUpperCase() + word.substring(1);
        });
    };
    return xTest;
})($, window);
