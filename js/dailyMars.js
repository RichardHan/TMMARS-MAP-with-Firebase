var globalDailyMars = [0, 0];

var GetdataFromAPI_JSON;
var _firstTime = true;

function AddCommas(str) {
    if (str.length <= 3) { return str; }
    var added = str.substr(str.length - 3);
    var remaining = str.substr(0, str.length - 3);
    return AddCommas(remaining) + ',' + added;
}

var addRandomToDataSource = function (dataSource) {
    return dataSource + "?random=" + Math.random();
};

function SyncCurrentNum() {
    var url_dailyNumber = configuration.fireBaseDataSources["dailyNumber"];
    var ref = new Firebase(url_dailyNumber);
    ref.on("value", function (snapshot) {
        var data = snapshot.val();
        GetdataFromAPI_JSON = data;
        UpdateUINumber(data);
    }, function (errorObject) {
        console.error(errorObject);
    });

    ref.once("value", function (snap) {
        setInterval(RefreshUINumber, 1000);
    });
}

//function GetCurrentNum() {
//    var url = addRandomToDataSource(configuration.dataSources["dailyNumber"]);
//    //not sure why need detect browser for IE.
//    if (BrowserDetect.browser == "Explorer" && window.XDomainRequest) {
//        var xdr = new XDomainRequest();
//        xdr.onload = function () {
//            var data = $.parseJSON(xdr.responseText);
//            if (data == null || typeof (data) == 'undefined') {
//                data = $.parseJSON(data.firstChild.textContent);
//            }
//            GetdataFromAPI_JSON = data;
//            UpdateUINumber(data);
//        };
//        xdr.onerror = function (e) {

//        }
//        xdr.open("GET", url);
//        xdr.send();

//    } else {
//        $.getJSON(url, GetdataFromAPI);
//    }
//}


function UpdateUINumber(json) {
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

//function GetdataFromAPI(json) {
//    GetdataFromAPI_JSON = json;
//    if (typeof (GetdataFromAPI_JSON) == 'object') {
//        RefreshUINumber();
//    }
//}

function RefreshUINumber() {
    if (typeof (GetdataFromAPI_JSON) == 'object') {
        UpdateUINumber(GetdataFromAPI_JSON);
    }
}

function UpdateDailyMars() {
    //globalDailyMars defined in js/dailyMars.js
    $("#appNum").html(AddCommas(globalDailyMars[0].toString()));
    $("#virusNum").html(AddCommas(globalDailyMars[1].toString()));
}

$(function () {
    SyncCurrentNum();
    //GetCurrentNum();  use SyncCurrentNum();
    //RefreshUINumber();
});

setInterval(UpdateDailyMars, 1000);
//setInterval(GetCurrentNum, 1000 * 60); //1 minute  ,  use SyncCurrentNum();
//setInterval(RefreshUINumber, 1000);