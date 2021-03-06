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
var http = require('https');

try {
    var goDaddyEndpoint = tl.getInput("godaddyAccount", true);
    var url = tl.getEndpointUrl(goDaddyEndpoint, true);
    var goDaddyApiUrl = url.replace("http://", "").replace("https://", "").replace('/', '');
    var goDaddyToken = tl.getEndpointAuthorizationParameter(goDaddyEndpoint, "apitoken", false);
    var goDaddySecret = tl.getEndpointAuthorizationParameter(goDaddyEndpoint, "apisecret", false);

    var actionType = tl.getInput("actionType", true);
    var domainName = tl.getInput("domainName", true);
    var type = tl.getInput("recordType", true);
    var name = tl.getInput("recordName", true);

    var inCreationMode = (actionType === "createUpdate");

    var value = tl.getInput("value", inCreationMode);
    var ttl = +(tl.getInput("ttl", inCreationMode));

    
    console.log("GoDaddy API URL: " + goDaddyApiUrl);
    console.log("GoDaddy API Token: " + goDaddyToken);
    console.log("GoDaddy API Secret: " + goDaddySecret);

    console.log("ActionType: " + actionType);
    console.log("DomainName: " + domainName);
    console.log("RecordType: " + type);
    console.log("RecordName: " + name);

    if(inCreationMode === true) {
        console.log("Value: " + value);
        console.log("TTL: " + ttl);
    }

    var authToken = "sso-key " + goDaddyToken + ":" + goDaddySecret;

    // Check if the domain exists for the current shopper
    let domainRequest = {
        host: goDaddyApiUrl,
        path: '/v1/domains/' + domainName,
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": authToken
        }
    };
    http.request(domainRequest, r => {
        if(r.statusCode === 404){
            tl.setResult(tl.TaskResult.Failed, "Domain Name: '" + domainName + "' not found");
        }
    }).on('error', err => {
        tl.setResult(tl.TaskResult.Failed, err || 'run() failed');
    }).end();
    // end of the check

    if(actionType === "createUpdate") {
        const data = JSON.stringify([{
            "data": value,
            "name": name,
            "type": type,
            "ttl": ttl
        }]);

        var options = {
            host: goDaddyApiUrl,
            path: '/v1/domains/' + domainName + '/records/' + type + '/' + name,
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Content-Length": data.length,
                "Authorization": authToken
            }
        };
    
        const req = http.request(options, response => {  });
    
        req.on('error', error => {
            tl.setResult(tl.TaskResult.Failed, error || 'run() failed');
        });
    
        req.write(data);
        req.end();

    } else if(actionType === "remove") {
        // List the current Records
        var listOptions = {
            host: goDaddyApiUrl,
            path: '/v1/domains/' + domainName + '/records/' + type,
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": authToken
            }
        };
        http.request(listOptions, r => {
            var body = '';

            r.on('data', d => {
                body += d;
            });
              
            r.on('end', () => {
                var list = JSON.parse(body);
                const index = list.findIndex(x=> x.name.toLowerCase() == name.toLowerCase());
                if(index > -1){
                   list.splice(index, 1);
                }

                // Update All records without old one
                const data = JSON.stringify(list);

                var options = {
                    host: goDaddyApiUrl,
                    path: '/v1/domains/' + domainName + '/records/' + type + '/',
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Length": data.length,
                        "Authorization": authToken
                    }
                };

                const req = http.request(options, response => { });
            
                req.on('error', error => {
                    tl.setResult(tl.TaskResult.Failed, error || 'run() failed');
                });
            
                req.write(data);
                req.end();
            });
            
        }).on("error", err => {
            tl.setResult(tl.TaskResult.Failed, err || 'run() failed');
        }).end();
    }
} catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message || 'run() failed');
}