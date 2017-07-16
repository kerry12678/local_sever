'use strict';
const jsdom = require("jsdom");
var path = require("path"),
    fs = require("fs"),
    path = require("path");
const { JSDOM } = jsdom;
const dom = new JSDOM('<!DOCTYPE html>' +
    '<html>' +
    '<head>' +
    '<meta charset="utf-8">' +
    '<title>!</title>' +
    '<style>' +
    '.s1 {' +
    'border-style: solid;' +
    'border-color: #ACD6FF;' +
    'border-width: 5px;' +
    'padding: 20px;' +
    'margin: 20px;' +
    '}' +
    '</style>' +
    '</head>' +
    '<body>' +
    '</body>' +
    '</html>');

var $ = require('jquery')(dom.window);

function get_html(path_name, key_list) {
    $("body div").remove();
    $("body").append('<div id="back" class="s1"><p></p></div>');
    $("body").append('<div id="MP4" class="s1"><p>文件</p></div>');
    $("body").append('<div id="dir" class="s1"><p>文件夹</p></div>');
    $("#back").append('<p><a href="getdirpath=>' + path_name + '">' + "back" + '</a></p>');
    key_list.map(function (x) {
        if (x["isFile"]) {
            $("#MP4").append('<p><a href="getfilepath=>' + path.join(path_name, x['name']) + '">' + x['name'] + '</a></p>');
            //$("#MP4").append('<p>' + x['name'] + '</p>');
        } else {
            $("#dir").append('<p><a href="getdirpath=>' + path.join(path_name, x['name']) + '">' + x['name'] + '</a></p>');
            //$("#dir").append('<p>' + x['name'] + '</p>');
        }
    });
    return $(":root").html();
};

function get_file_list(path_name) {
    return new Promise(function (resolve, reject) {
        fs.readdir(path_name, function (err, files) {
            if (!err) {
                resolve(files);
            } else {
                console.log(err);
                reject([]);
            }
        });
    });
};

var get_file_stat = function (file_path, file_name) {
    return new Promise(function (resolve, reject) {
        fs.stat(path.join(file_path, file_name), function (err, stat) {
            if (!err) {
                resolve({ name: file_name, isFile: stat.isFile(), dateModify: stat.mtime});
            } else {
                console.log(err);
                reject(undefined);
            }
        });
    });
};

module.exports = async (path_name) => {
    var file_stat_list = [];
    var files = [];
    try {
        files = await get_file_list(path_name);
    } catch (err) {
        console.log(err);
    }
    console.log(files);
    for (var f of files) {
        var key_list = [];
        try {
            key_list = await get_file_stat(path_name, f);
        } catch (err) {
            console.log(err);
            continue;
        }
        file_stat_list.push(key_list);
    }
    file_stat_list = file_stat_list.sort((x, y) => {
        return y["dateModify"]-x["dateModify"];
    });
    return get_html(path_name, file_stat_list);
};