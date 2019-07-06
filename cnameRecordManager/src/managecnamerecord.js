"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });

var tl = require('azure-pipelines-task-lib');
var shell = require('node-powershell');
var http = require('http');

try {
    var godaddyKey = tl.getInput("godaddyKey", true);
    var godaddySecret = tl.getInput("godaddySecret", true);
    var domainName = tl.getInput("domainName", true);
    var cname = tl.getInput("cname", true);
    var alias = tl.getInput("alias", true);
    var actionType = tl.getInput("actionType", true);
    
    console.log("GoDaddyKey: " + godaddyKey);
    console.log("GoDaddySecret: " + godaddySecret);
    console.log("ActionType: " + actionType);
    console.log("DomainName: " + domainName);
    console.log("CName: " + cname);
    console.log("Alias: " + alias);

    var url = "https://api.ote-godaddy.com";
    var options = {
        host: url,
        path: '/v1/domains/' + domainName,
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": godaddyKey + ":" + godaddySecret
        }
    }
    
    http.request(options, function(res){
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function(chunk){
            console.log('BODY: ' + chunk);
        });
    }).end();

} catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message || 'run() failed');
}