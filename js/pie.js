var updateInterval, dataSources, colors, config;
var fillConfig = function (configuration) {
    if (configuration) {
        updateInterval = configuration.updateInterval;
        dataSources = configuration.dataSources;
        colors = configuration.colors;
        config = configuration.config;
    }
};

var runtimeData = {
    topApp: {
        updateHistory: 0
    },
    //topArea: {
    //    updateHistory: 0
    //},
    topVirus: {
        updateHistory: 0
    }
};

var init = function () {
    caculateRuntimeConfig();
    runTicker();
};
var runTicker = function () {
    createjs.Ticker.useRAF = true;
    createjs.Ticker.setFPS(40);
    createjs.Ticker.addListener(tick);
};
var tick = function () {
    checkUpdates();
};

var caculateRuntimeConfig = function () {
    updateInterval.topVirus = updateInterval.pies;
    updateInterval.topApp = updateInterval.pies;
    //updateInterval.topArea = updateInterval.pies;
};

var checkUpdates = function () {
    var now = Date.now();
    checkUpdate(now, "topVirus");
    checkUpdate(now, "topApp");
    //checkUpdate(now, "topArea");
};
var checkUpdate = function (now, sName) {
    //debugger;
    if (now - runtimeData[sName].updateHistory < updateInterval[sName]) return;
    else {
        update(sName);
        runtimeData[sName].updateHistory = now;
    }
};

var update = function (sName) {

    var url = fireBaseDataSrouce[sName];
    //console.log(url);
    //debugger;
    var ref = new Firebase(url);
    ref.on("value", function (snapshot) {
        var data = snapshot.val();
        var fnCallback = callBack["cbUpdate_" + sName];
        fnCallback(data);
    }, function (errorObject) {
        console.error(errorObject);
    });

    //console.log("sName:" + sName + "   " + dataSources[sName]);
    //var decoratedDataSource = addRegionToDataSource(addRandomToDataSource(dataSources[sName]));
    //$.getJSON(decoratedDataSource, function(response) {
    //	var fnCallback = callBack["cbUpdate_" + sName];
    //	fnCallback(response);
    //});
};

var addRandomToDataSource = function (dataSource) {
    return dataSource + "?random=" + Math.random();
};

var addRegionToDataSource = function (dataSource) {
    if (config.region) {
        return dataSource + "&r=" + config.region;
    } else {
        return dataSource;
    }
};

var callBack = {
    cbUpdate_topVirus: function (json) {
        cbUpdate_pie(json, "topVirus", "Top 5 Malware");
    },
    cbUpdate_topApp: function (json) {
        cbUpdate_pie(json, "topApp", "Top 5 Apps");
    },
    cbUpdate_topArea: function (json) {
        cbUpdate_pie(json, "topArea", "Top 5 Regions");
    }
};

function cbUpdate_pie(json, container, pieTitle) {
    $("#" + container).highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            backgroundColor: 'rgba(0, 0, 0, 0)',
            borderwidth: 0
        },
        title: {
            text: pieTitle,
            style: {
                color: "#ffffff"
            }
        },
        tooltip: {
            // pointFormat: '<b>{point.percentage}%</b>',
            // valueDecimals: 1,
            formatter: function () {
                //return '<b>'+this.point.name+'<br>'+this.percentage.toFixed(1)+'%</b>';
                return '<b>' + this.point.name + '<br>' + this.point.y + '</b>';
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        legend: {
            align: "right",
            verticalAlign: "middle",
            layout: "vertical",
            width: 150,
            borderWidth: 0,
            itemStyle: {
                color: '#fff',
                fontSize: '10px',
            },
            itemHoverStyle: {
                color: '#fff'
            }
        },
        series: [{
            type: 'pie',
            name: 'Top',
            data: json
        }]
    });
}

fillConfig(configuration);
init();