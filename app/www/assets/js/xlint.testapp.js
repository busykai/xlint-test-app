/*
 * Copyright 2013-2015 Intel Corporation.
 * 
 * See the file LICENSE for copying permission.
 */

//events when DOM be loaded

/*globals xTest, iScroll, FastClick*/
"use strict";

function runTest() {
    var $cssDomTest = $('.css-dom-style');
    for (var i = $cssDomTest.length; i--; ) {
        xTest.css.domStyle($cssDomTest[i].id);
    }
}

function getCheckboxValue() {
    var checks = $('.manual-tesing');  //$('input[type="checkbox"]');
    var feature;
    var typeExp = /([a-z]+)\-(\S+)/;
    checks = Array.prototype.slice.call(checks);
    for (var i in checks) {
        if (checks.hasOwnProperty(i)) {
            if (/prefix/.test(checks[i].id)) {
                feature = checks[i].id.replace(/check-prefix-/, window.data.prefix);
            } else {
                feature = checks[i].id.replace(/check-/, '');
            }
            feature = typeExp.exec(feature);
            var supported = (checks[i].checked && 'y') || 'n';
            xTest.setCompatibilityData(feature[1], feature[2], supported);
        }
    }
}

function submitResult(e) {
    var res = confirm("Sure to submit the data?");
    if (!res) { return false; }
    e.stopPropagation();
    e.preventDefault();
    var $subBtn = $(this);
    var url = $.trim($('#txt-url').val());
    $subBtn.addClass('loading').css('color', 'transparent').attr('disabled', true);

    getCheckboxValue();
    $.ajax({
        url: url,
        data: window.data,
        type: 'POST',
        dataType: 'json',
        timeout: 6000,
        success: function(res) {
            if (res) {
                alert('Submitted successfully~');
            }
        },
        error: function(xhr, errorType) {
            var errMsg = '"' + errorType + '", please try again~';
            alert(errMsg);
        },
        complete: function() {
            $subBtn.removeClass('loading').css('color', '#808080').removeAttr('disabled');
        }
    });
    return false;
}

$(function(){
    //fastclick init
    FastClick.attach(document.body);

    var data = window.data;

    //set runtime info for browsers
    if (!data.id) {
        xTest.setRuntimeInfo();
        $('#runtime-info').text(data.id + '_' + data.model);
    }

    $('.vender-prefix-tag').text(xTest.venderInfo.low);

    function go2Setting() { $('#page-setting').removeClass('slide2right').addClass('slide2left'); }
    function go2Testing() { $('#page-setting').removeClass('slide2left').addClass('slide2right');}

    function toggleCheck(e) {
        e.preventDefault();
        e.stopPropagation();
        var $checkbox = $(this).find('input[type="checkbox"]')[0];
        $checkbox.checked = !$checkbox.checked;
    }

    // events binding
    $('#btnSetting').on('click', go2Setting);

    $('#btnBack').on('click', go2Testing);

    $('#subResult').on('click', submitResult);

    $('.checkbox').on('touchstart', function(e){ e.stopPropagation(); }).on('click', toggleCheck);  //For fixing iScroll bug which fire double click events

    $('#checkbox-set-autoTest').on('click', function(){ $('.auto-test').toggle(); });

    runTest();
});