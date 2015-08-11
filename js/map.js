(function() {
	mars.map = function(){};

	mars.map.prototype.run = function(configuration) {
		saveImgSize();
		fillConfig(configuration);
		console.log("run map");
	};

	var updateInterval, dataSources, colors, config;
	var fillConfig = function(configuration) {
			if(configuration) {
				updateInterval = configuration.updateInterval;
				dataSources = configuration.dataSources;
				colors = configuration.colors;
				config = configuration.config;
			}
		};


	//init
	//const
	var STATE = {
		"START": 0,
		"CONTINUE": 1,
		"STOP": 2
	};
	//variable
	var backCanvasId = "backCanvas";
	var canvasId = "demoCanvas";
	var stage = new createjs.Stage(canvasId);
	var templateNormal = ' <span > { 1 }  @  { 0 }.&nbsp;&nbsp;&nbsp;&nbsp;</span>';
	var templateVirus = ' <span style="color:#FF0000;"> { 2 }  @  { 0 }.&nbsp;&nbsp;&nbsp;&nbsp;</span>';
	var runtimeData = {
		scale: 1.0,
		news: {
			updateHistory: 0,
			xpos: 0
		},
		dots: {
			updateHistory: 0,
			buffer: []
			//, bufferIsNew: false
		},
		circles: {
			updateHistory: 0,
			buffer: [],
			beginIndex: 0,
			duration: 0,
			interval: 1000,
			state: STATE.STOP,
			//3 states:start,continue,stop
			lastShowHistory: 0 //last circle show time
			//lock:false //synchronic lock
		},
		scannumber: {
			updateHistory: 0
		}
	};
	var translator = {
		bx: 0,
		kx: 0,
		by: 0,
		ky: 0
	};
	var circleShapeVirus;
	var circleShapes = [];



	//drawings
	mars.map.prototype.init = function() {
			this.layoutHTMLElements();
			caculateRuntimeConfig();
			registerEvent();
			createCircleShapes();
			correctCoordinate(config.point1, config.point2);
			runTicker();

		}

	var runTicker = function() {
			createjs.Ticker.useRAF = true;
			createjs.Ticker.setFPS(40);
			createjs.Ticker.addListener(tick);
		};

	var tick = function() {
			//console.log("TICK!!!");
			checkUpdates();
			updateNewsUI();
			updateCircleUIX();
			stage.update();
		};

	//layout HTML Elements
	mars.map.prototype.layoutHTMLElements = function() {
			var containerW = $("#container").width();
			var containerH = $("#container").height();
			var winW = $(window).width();
			var winH = $(window).height();
			var pie_span = winW / 3;
			var pie_width = winW/3-20;
			var pie_left = winW/6;
			//console.log("winw=" + winW + " winH=" + winH);
			$("#topVirus").css({"left": pie_left, "top": winH * 0.89 - 150, "width": pie_width}).show();
			$("#topApp").css({"left": pie_left + pie_span, "top": winH * 0.89 - 150, "width":pie_width}).show();
			//$("#topArea").css({"left": 10 + pie_span * 2, "top": winH * 0.89 - 170, "width": pie_width}).show();
			//$("#map").css({"margin-top": winW*0.05});
			$("#marquee_box").css({"top": winH - 16+"px", "width": winW, "display": "block"});
			redraw(containerW, containerH);
			layoutMap(containerW);
		}

	var layoutMap = function(winW) {
			var mapWidth = $("#map img").width();
			var left = (winW - mapWidth) / 2;
			if(left > 0) {
				$("#map").attr("left", left);
				console.log("left:" + left);
			}
		};

	var caculateRuntimeConfig = function() {
			return;
		};

	var registerEvent = function() {
			registerMapEvent();
		};

	var registerMapEvent = function() {
			return;
		};

	var createCircleShapes = function() {
			for(var i = 0; i < config.max_circles_number_show_per_time; i++) {
				// draw the circle, and put it on stage
				circleShapes.push(createCircleShape(colors.normal));
			}
			circleShapeVirus = createCircleShape(colors.virus);
		};

	var correctCoordinate = function(point1, point2) {
			/*
			(Lng1,Lat1)=>(x1,y1)
		    (Lng2,Lat2)=>(x2,y2)
			*/
			var x1 = point1.x,
				y1 = point1.y,
				Lng1 = point1.Lng,
				Lat1 = point1.Lat;
			var x2 = point2.x,
				y2 = point2.y,
				Lng2 = point2.Lng,
				Lat2 = point2.Lat;
			translator = solve_translator(x1, y1, Lng1, Lat1, x2, y2, Lng2, Lat2);
			console.log(translator);
		};


	//ajax data 
	var checkUpdates = function() {
			var now = Date.now();
			checkUpdate(now, "news");
			checkUpdate(now, "dots");
			checkUpdate(now, "circles");
		};
	var checkUpdate = function(now, sName) {
			if(now - runtimeData[sName].updateHistory < updateInterval[sName]) return;
			else {
				update(sName);
				runtimeData[sName].updateHistory = now;
			}
		};

	//default update
	var update = function(sName) {
			var decoratedDataSource = addRegionToDataSource(addRandomToDataSource(dataSources[sName]));
			console.log(decoratedDataSource);
			$.getJSON(decoratedDataSource, function(response){
				//console.log("cbUpdate_"+sName);
				var fnCallback = window["cbUpdate_" + sName];
				//console.log(fnCallback + " : update callback");
				fnCallback(response);
			});
		};

	var addRandomToDataSource = function(dataSource) {
			return dataSource + "?random=" + Math.random();
		};

	var addRegionToDataSource = function(dataSource) {
			if(config.region) {
				return dataSource + "&r=" + config.region;
			} else {
				return dataSource;
			}
		};


	window.cbUpdate_news = function(response) {
		var aNewsJson = response;
		var translateNewsFromJson2Html = function(aNews) {
				var aNewsHtml = "";
				for(var i = 0; i < aNews.length; i++) {
					if(aNews[i][2]) { //virus
						aNewsHtml += templateVirus.replace("{ 2 }", aNews[i][2]).replace("{ 0 }", aNews[i][0]);
					} else {
						aNewsHtml += templateNormal.replace("{ 1 }", aNews[i][1]).replace("{ 0 }", aNews[i][0]);
					}
				}
				return aNewsHtml;
			};
		var aNewsHtml = translateNewsFromJson2Html(aNewsJson);
		$('#marquee').html(aNewsHtml);
		runtimeData["news"].xpos = 0;
	};

	window.cbUpdate_dots = function(response) {
		runtimeData["dots"].buffer = response;
		updateDotsUI();
	};

	var caculateInterval_between_circles = function(fetched_circles_count) {
			var circles_show_count = Math.min(fetched_circles_count, config.max_circles_number_show_per_fetch);
			var interval = (updateInterval.circles + config.duration_of_single_circle_animate * 2) / circles_show_count;
			return interval;
		};

	window.cbUpdate_circles = function(response) {
		runtimeData["circles"].buffer = response;
		runtimeData["circles"].beginIndex = 0;
		runtimeData["circles"].interval = caculateInterval_between_circles(runtimeData["circles"].buffer.length);
		runtimeData["circles"].state = STATE.START;
		console.log("interval_between_circles=" + runtimeData["circles"].interval);
	};



	//drawing api
	var updateDotsUI = function() {
			//draw dots on backCanvas;
			var aXYs = translateGeos2xys(runtimeData["dots"].buffer);
			drawDots(backCanvasId, aXYs);
			//	}
		};
	var updateNewsUI = function() {
			$('#marquee').css('left', runtimeData["news"].xpos);
			runtimeData["news"].xpos -= 1;
		};
	var updateCircleUIX = function() {
			if(STATE.STOP == runtimeData["circles"].state) {
				//console.log("STATE.STOP");
				return;
			}
			if(STATE.START == runtimeData["circles"].state) {
				console.log("STATE.START");
				runtimeData["circles"].beginIndex = 0;
				runtimeData["circles"].state = STATE.CONTINUE;
			}
			if(STATE.CONTINUE == runtimeData["circles"].state) {
				if(runtimeData["circles"].beginIndex >= runtimeData["circles"].buffer.length) {
					runtimeData["circles"].state = STATE.STOP;
					return;
				} else {
					showCircleShapeOnTime();
				}
			} else {
				console.log("unknow state:" + runtimeData["circles"].state);
			}

		};

	var showCircleShapeOnTime = function() {
			var now = Date.now();
			var elapse = now - runtimeData["circles"].lastShowHistory;
			if(elapse < runtimeData["circles"].interval) {
				return;
			} else {
				runtimeData["circles"].lastShowHistory = now;
				var circleShape = circleShapes.pop();
				if(circleShape) {
					showCircleShape(circleShape);
				} else {
					console.log("no avaliable circleShape");
				}
			}
		};

	var showCircleShape = function(circleShape) {
			//console.log("show:" + runtimeData["circles"].beginIndex + "/" + runtimeData["circles"].buffer.length + " @" + Date.now());
			var aGeo = runtimeData["circles"].buffer[runtimeData["circles"].beginIndex++]; //here is a ++
			var aXy = translateGeo2xy(aGeo);
			//console.log("x="+aXy[0]+" y="+aXy[1]);
			if(aXy[3].isVirus) { //isVirus
				recycleCircleShape(circleShape); //recycle normal circleShaple
				if(!createjs.Tween.hasActiveTweens(circleShapeVirus)) { //virus shape is not busy
					circleShapeVirus.x = aXy[0];
					circleShapeVirus.y = aXy[1];
					tweenVirusShape(circleShapeVirus);
				}
			} else { //is Normal
				circleShape.x = aXy[0];
				circleShape.y = aXy[1];
				tweenNormalShape(circleShape);
			}

		};

	var recycleCircleShape = function(circleShape) {
			circleShapes.push(circleShape);
			//console.log("recycleCircleShape");
		};

	var tweenNormalShape = function(circleShape) {
			//console.log("tweenNormalShape");
			tweenCircle(circleShape).call(recycleCircleShape, [circleShape]);
		};
	var tweenVirusShape = function(circleShapeVirus) {
			console.log("tweenVirusShape");
			tweenCircle(circleShapeVirus);
		};

	var tweenCircle = function(circleShape) {
			circleShape.alpha = 10;
			return createjs.Tween.get(circleShape, {
				override: true
			}).to({
				scaleX: 5,
				scaleY: 5,
				alpha: 0.1
			}, config.duration_of_single_circle_animate, createjs.Ease.quartOut).to({
				scaleX: 0.2,
				scaleY: 0.2
			});
		};

	var createCircleShape = function(color) {
			var circleShape = new createjs.Shape();
			circleShape.graphics.setStrokeStyle(0.3);
			circleShape.graphics.beginStroke(color);
			circleShape.graphics.drawCircle(0, 0, 5);
			circleShape.graphics.endStroke();
			circleShape.alpha = 0;
			stage.addChild(circleShape);
			return circleShape;
		};

	var drawDot = function(canvasId, x, y, r, color) {
			var c = document.getElementById(canvasId);
			var ctx = c.getContext("2d");
			ctx.arc(x, y, r, 0, 2 * Math.PI);
			ctx.fillStyle = color;
			ctx.fill();
		};

	var drawDots = function(canvasId, aXYs) {
			var c = document.getElementById(canvasId);
			var ctx = c.getContext("2d");
			ctx.clearRect(0, 0, c.width, c.height);
			//ctx.globalAlpha = 0.5;
			for(var i = 0; i < aXYs.length; i++) {
				var aXY = aXYs[i];
				var x = aXY[0],
					y = aXY[1],
					r = aXY[2];
				var extra=aXY[3];
				var	color = extra.isVirus ? colors.virus : colors.normal;
				ctx.globalAlpha = extra.alpha || 0.5;
				ctx.beginPath();
				ctx.arc(x, y, r, 0, 2 * Math.PI, false);
				ctx.fillStyle = color;
				ctx.fill();
				ctx.closePath();
			};



		};

	//geo translate
	var translateGeos2xys = function(aGeos) {
			//data=[ [ -6.1743927001953125, 106.82940673828125, 159,'virus' ],[...]]
			var aXYs = [];
			for(var i = 0; i < aGeos.length; i++) {
				aGeo = aGeos[i];
				aXYs.push(translateGeo2xy(aGeo));
			};
			return aXYs;
		};

	var translateGeo2xy = function(aGeo) {
			if(!aGeo) return;
			var lng = aGeo[0];
			var lat = aGeo[1];
			var isVirus = false;
			if(aGeo[3]) {
				isVirus = true;
			}
			var r = getR(aGeo[2], isVirus);
			var x = (lng * translator.kx + translator.bx);
			var y = (lat * translator.ky + translator.by);
			var scale = runtimeData["scale"] || 1;
			if(scale) {
				//r *= scale;
				x *= scale;
				y *= scale;
			}
			var a = getAlpha(aGeo[2], isVirus);
			return [x, y, r, {"isVirus":isVirus,"alpha":a}];
		};

	var getR = function(counter, isVirus) {
			return config.r1_hold;
			//			var r_hold;
			//			if(isVirus) {
			//				color = config.virus;
			//				if(counter <= 9) {
			//					r_hold = config.r1_hold;
			//				} else if(counter <= 99) {
			//					r_hold = config.r2_hold;
			//				} else {
			//					r_hold = config.r3_hold;
			//				}
			//			} else {
			//				if(counter <= 99) {
			//					r_hold = config.r1_hold;
			//				} else if(counter <= 999) {
			//					r_hold = config.r2_hold;
			//				} else {
			//					r_hold = config.r3_hold;
			//				}
			//			}
			//			return r_hold;
		};

	var getAlpha = function(counter, isVirus) {
			var a_hold;
			if(isVirus) {
				a_hold = config.a3_hold;
			} else {
				if(counter <= 99) {
					a_hold = config.a1_hold;
				} else if(counter <= 999) {
					a_hold = config.a2_hold;
				} else {
					a_hold = config.a3_hold;
				}
			}
			return a_hold;
		}


		//coordinate correct
		//L=k*pixel+b //L is Latitude,Longtitude,pixel is pixel x,y
	var solve_b = function(x1, x2, L1, L2) {
			b = (x2 * L1 - x1 * L2) / (L1 - L2);
			return b;
		};
	var solve_k = function(x1, x2, L1, L2) {
			k = (x1 - x2) / (L1 - L2);
			return k;
		};

	// var solve_translator({x1,y1},{Lng1,Lat1},{x2,y2},{Lng2,Lat2})
	var solve_translator = function(x1, y1, Lng1, Lat1, x2, y2, Lng2, Lat2) {
			var bx = solve_b(x1, x2, Lng1, Lng2);
			var kx = solve_k(x1, x2, Lng1, Lng2);
			var by = solve_b(y1, y2, Lat1, Lat2);
			var ky = solve_k(y1, y2, Lat1, Lat2);
			var translator = {
				bx: bx,
				kx: kx,
				by: by,
				ky: ky
			};
			return translator;
		};

	var scaleCoords = function(coords, scale) {
			var array1 = coords.split(",");
			var scaled_coords = "";
			for(var i = 0; i < array1.length; i++) {
				var xy = parseInt(array1[i]);
				xy = Math.round(xy * scale);
				scaled_coords += xy;
				if(i < array1.length - 1) {
					scaled_coords += ",";
				}
			};
			return scaled_coords;
		};

	var redraw = function(winW, winH) {
			var scale = winW / 1280.0;
			var map_size_factor = config.map_size_factor || 1;
			runtimeData["scale"] = scale * map_size_factor;
			redrawMap();
			redrawDots();
			redrawCircle();
		};

	var redrawMap = function() {
			//console.log("redrawMap");
			var scalePercent = runtimeData["scale"];
			var mapImg = $("#map img");
			var oWidth = mapImg.attr("oWidth");
			var oHeight = mapImg.attr("oHeight");
			var sWidth= oWidth * scalePercent;
			var sHeight=oHeight * scalePercent;
			$("#map img").attr("width",sWidth).attr("height", sHeight);
			$("#map canvas").attr("width",sWidth).attr("height", sHeight);
		};

	var saveImgSize = function() {
			var mapImg = $("#map img");
			var oWidth = mapImg.attr("width");
			var oHeight = mapImg.attr("height");
			mapImg.attr("oWidth", oWidth);
			mapImg.attr("oHeight", oHeight);
		};


	var redrawDots = function() {
			updateDotsUI();
		};

	var redrawCircle = function() {

		};

})();