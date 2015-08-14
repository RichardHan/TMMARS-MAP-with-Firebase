var configuration = {};
configuration.updateInterval = {
    news: 1000 * 60 * 5,//5 minutes
    dots: 1000 * 60 * 5,//5 minutes
    circles: 1000 * 60,//1 minute
    pies: 1000 * 60 * 60,//1 hour
    scannumber: 1000 * 60 * 60 //1 hour
};
var realDataSources = {
    circles: "https://njdc.rest.mars.trendmicro.com/akamailog/latest",
    topVirus: "https://njdc.rest.mars.trendmicro.com/akamailog/top-virus",
    topApp: "https://njdc.rest.mars.trendmicro.com/akamailog/top-app",
    //topArea: "https://njdc.rest.mars.trendmicro.com/akamailog/top-area",
    news: "https://njdc.rest.mars.trendmicro.com/akamailog/log",
    dots: "https://njdc.rest.mars.trendmicro.com/akamailog/base"
};

var fireBaseDataSrouce = {
    circles: "https://mars-map.firebaseio.com/latest",
    topVirus: "https://mars-map.firebaseio.com/top-virus",
    topApp: "https://mars-map.firebaseio.com/top-app",
    //topArea: "https://mars-map.firebaseio.com/top-area",
    news: "https://mars-map.firebaseio.com/log",
    dots: "https://mars-map.firebaseio.com/base",
    dailyNumber: "https://mars-map.firebaseio.com/daily-scanned-number",
};

configuration.dataSources = realDataSources;
configuration.fireBaseDataSources = fireBaseDataSrouce;
configuration.colors = {
    normal: "#7CC0EF",
    virus: "#C71D37"
};
configuration.config = {
    max_circles_number_show_per_fetch: 100,
    duration_of_single_circle_animate: 2000,
    max_circles_number_show_per_time: 5,
    r1_hold: 1,
    r2_hold: 2,
    r3_hold: 4,
    a1_hold: 0.2,
    a2_hold: 0.5,
    a3_hold: 1,
    //2 points to rectify the map
    point1: {
        x: 15,
        y: 66,
        Lng: -168.110458,
        Lat: 65.640155
    },
    point2: {
        x: 1209,
        y: 422,
        Lng: 178.546646,
        Lat: -37.688167
    },
    map_size_factor: 1
};
