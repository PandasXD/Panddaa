
$(function () {

	/******************************************************************
	 * Some utility functions
	 *****************************************************************/

	 // Logs which signal a service publishes
	function inspectService(serviceName) {
		$.getService(serviceName, function (module) {
			//log("module.__mobj:");
			//log(module.__mobj);
			// I could print methods, but there are usually a quadrillion
			var signals = module.__mobj[1][1];
			log("signals in " + serviceName + ":");
			for (var i in signals)
			{
			  var signalName = signals[i][1];
			  log(" " + i + ": " + signalName);
			}
		});
	}
	//inspectService("PackageManager"); 

	function getMiniTimeStamp() {
		var now = new Date();
		return "" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
	}
	
	 /******************************************************************
	 * An example of getting information from a module
	 *****************************************************************/

	function refreshLanguage() {
		$("#currentlanguage").html("(finding service)");
		$.getService("ALTextToSpeech", function (tts) {
			$("#currentlanguage").html("(waiting for answer...)");
			tts.getLanguage().done(function (reply) {
				$("#currentlanguage").html(reply);
			}).fail(function() {
				$("#currentlanguage").html("failed.");
			});
		});
	}

	$("#getlangbutton").mousedown(function () {
		refreshLanguage();
	});

	/******************************************************************
	 * (using an ALMemory helper function)
	 *****************************************************************/
	
	$("#finishbutton").mousedown(function () {
		$.raiseALMemoryEvent("tablet/exitApp", getMiniTimeStamp());
	});
	
	/******************************************************************
	 * An example of sending information to a module (calling methods)
	 *****************************************************************/

	$(".flag").mousedown(function() {
		var lang = $(this).data("lang")
		$.raiseALMemoryEvent("tablet/setLanguage", lang);
		$.getService("ALTextToSpeech", function (tts) {
			tts.setLanguage(lang).done(refreshLanguage).fail(function (data) {
				log("Failed to set language to " + lang + ": " + data);
			});
		});
	});
	
	function sayEnteredSentence() {
		var sentenceToSay = $("#sentence").val();
		if (sentenceToSay) {
			$.getService("ALTextToSpeech", function (tts) {
				tts.say(sentenceToSay);
				$("#sentence").val("");
			});
		}
	}
	
	$("#saybutton").mousedown(sayEnteredSentence);

	$("#sentence").keypress(function(event) {
		if ( event.which == 13 ) { // enter key
			sayEnteredSentence();
			event.preventDefault();
		}
	});
	
	/******************************************************************
	 * Two ways of playing a video: asking Choregraphe to do so, and
	 * directly calling the module
	 *****************************************************************/

	$("#callbackfallvideobutton").mousedown(function () {
		// This requires the corresponding behavior to implement a play video event
		$.raiseALMemoryEvent("tablet/triggerFallVideo", getMiniTimeStamp());
		log("Requested video with box!");
	});


	$("#directvideobutton").mousedown(function() {
		$.getService("ALTabletService", function (tabletService) {
			var subPath = "video/VideoFall.mp4";
			//It might be possible to get parts of the fullpath from the location...
			var fullPath = "http://198.18.0.1/apps/tablet-example/" + subPath
			log("Requesting video: " + fullPath);
			tabletService.playVideo(fullPath).fail(function (data) {
				log("Failed to request video.");
			});
		});
	});	

	$("#updatepreferences").mousedown(function() {
		$.getService("ALPreferenceManager", function(preferences) {
			preferences.update().done(function() {
			}).fail($.onQimError);
		});
	});
	
	$("#errorbutton").mousedown(function() {
		this.will.cause.an.error;
	});

	/******************************************************************
	 * This is a simple receiving ALMemory events from the robot
	 *****************************************************************/
	/*
	$.subscribeToALMemoryEvent("Launchpad/NumPeopleZone1", function(value) {
		$("#peoplezone1").html(value);
	});
	$.subscribeToALMemoryEvent("Launchpad/NumPeopleZone2", function(value) {
		$("#peoplezone2").html(value);
	});
	$.subscribeToALMemoryEvent("Launchpad/NumPeopleZone3", function(value) {
		$("#peoplezone3").html(value);
	});
	*/
	
	/******************************************************************
	 * This is an example of receiving ALMemory events from the robot
	 *****************************************************************/

	if ($("#touchevents").length) {
		$("#touchevents").html("(subscribing...)");
		
		var sensorValues = {};
		var bodyParts = [];
		var zones = {};
		
		function insertSensorValue(sensor, value) {
			sensordef = sensor.split('/');
			bodyPart = sensordef[0];
			zone = sensordef[sensordef.length - 1];
			if (!(bodyPart in sensorValues)) {
				sensorValues[bodyPart] = {};
				zones[bodyPart] = [];
				bodyParts.push(bodyPart);
				bodyParts.sort();
			}
			if (zones[bodyPart].indexOf(zone) < 0) {
				zones[bodyPart].push(zone);
				zones[bodyPart].sort();
			}
			sensorValues[bodyPart][zone] = value;
		}
		
		function refreshSensorDisplay() {
			$("#touchevents").html("");
			$.each(bodyParts, function(i, bodyPart) {
				$("#touchevents").append(bodyPart + ": ");
				$.each(zones[bodyPart], function(j, zone) {
					var span = $("<span>").html(" " + zone + " ");
					if (sensorValues[bodyPart][zone]) {
						span.css("background-color", "red");
					}
					$("#touchevents").append(span);
				});
				$("#touchevents").append("<br />");
			});
		}
	
		$.subscribeToALMemoryEvent("TouchChanged", function(sensorValueTuples) {
			$.each(sensorValueTuples[0], function (index, tuple) {
				insertSensorValue(tuple[0], tuple[1]);
			});
			refreshSensorDisplay();
		}, function() {
			// This is an optional function, called when the subscription is done.
			$("#touchevents").html("(subscribed!)");
		});
	}
	
	/******************************************************************
	 * This is an example of receiving messages from the robot, in the
	 * form of signals from (NaoQi2) services. Most NaoQi modules don't
	 * implement any interesting services, but some do. I haven't seen
	 * this work yet though (more tests are needed)
	 *
	 * Until this is fixed, the div containing packageevents is usually
	 * commented out, in which case none of this is executed
	 *****************************************************************/

	if ($("#packageevents").length) {
		 // Logs addition and removal of packages.
		$.getService("PackageManager", function (pm) {
			// Calling a method works
			pm.getPackages().done(function (arg) {
				$("#packageevents").append("Packages: " + arg.length);
				log("Packages: " + arg.length);
			});
			// Subscribing to signals doesn't work.
			log("Subscribing to packages...");
			pm.packageInstalled.connect(function (arg) {
				$("#packageevents").append("Installed: " + arg);
				log("Installed: " + arg);
			});
			pm.packageRemoved.connect(function (arg) {
				$("#packageevents").append("Removed: " + arg);
				log("Removed: " + arg);
			});
		});
		log("[DBG] Listening for package events!");
	}

	refreshLanguage(); // But what if qim is not there? I could do a while or something.
});

