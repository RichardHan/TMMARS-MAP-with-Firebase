var globalDailyMars = [0, 0];

var GetdataFromAPI_JSON;
var _firstTime = true;

function addCommas(str) {
    if (str.length <= 3) { return str; }
    var added = str.substr(str.length - 3);
    var remaining = str.substr(0, str.length - 3);
    return addCommas(remaining) + ',' + added;
}

function getCurrentNum() {
    var url = "https://njdc.rest.mars.trendmicro.com/akamailog/daily-scanned-number?random=" + Math.random();
    if (BrowserDetect.browser == "Explorer" && window.XDomainRequest) {
        var xdr = new XDomainRequest();
        xdr.onload = function () {
            var data = $.parseJSON(xdr.responseText);
            if (data == null || typeof (data) == 'undefined') {
                data = $.parseJSON(data.firstChild.textContent);
            }
            GetdataFromAPI_JSON = data;
            updateUINumber(data);
        };
        xdr.onerror = function (e) {

        }
        xdr.open("GET", url);
        xdr.send();

    } else {
        //$.getJSON(url, updateUINumber);
        $.getJSON(url, GetdataFromAPI);
    }
}

function updateUINumber(json) {
    var queryNumFromServer = json[0][0];
    var queryIncrement = json[0][1];
    var malwareNumFromServer = json[1][0];
    var malwareIncrement = json[1][1];
    var gmtHour = json[2];

    var queryNumClient;
    var malwareNumClient;

    var today = new Date();
    var now = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    var time_span = (now.getTime() - today.getTime()) / 1000; //the seconds elapsed from 0:00
    queryNumClient = time_span * queryIncrement;
    malwareNumClient = time_span * malwareIncrement;

    globalDailyMars = [Math.ceil(queryNumClient), Math.ceil(malwareNumClient)];

}


function GetdataFromAPI(json) {
    GetdataFromAPI_JSON = json;
    if (typeof (GetdataFromAPI_JSON) == 'object') {
        RefreshUINumber();
    }
}

function RefreshUINumber() {
    if (typeof (GetdataFromAPI_JSON) == 'object') {
        updateUINumber(GetdataFromAPI_JSON);
    }
}

$(function () {
    getCurrentNum();
    RefreshUINumber();
});

setInterval(getCurrentNum, 1000 * 60); //1 minute
setInterval(RefreshUINumber, 1000);