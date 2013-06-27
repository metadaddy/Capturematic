function MainMenuObj() {}
function ListViewObj() {}
function FormObj() {
	this.progressDottedDotWidth = 20;
}
function MapObj() {
	this.map;
	this.view;
	this.defaultIcon = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
	this.userIcon = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
	this.initLat = 37.7750;
	this.initLng = 122.4183;
	this.markers = new Array();
	this.openInfowindow = null;
	this.userPosition = null;
}

var mainMenuObj = new MainMenuObj(),
	listViewObj = new ListViewObj(),
	formObj = new FormObj(),
	mapObj = new MapObj();

$(document).ready(function() {
	mainMenuObj.init();
	listViewObj.init();
	formObj.init();
});
MainMenuObj.prototype.init = function() {
	var t = this;
	t.setupMenuSlider();
}
MainMenuObj.prototype.setupMenuSlider = function() {
	$("#app-wrapper").removeClass("menu-open");
	$('#main-menu-button').click(function() {
		$("#app-wrapper").toggleClass("menu-open");
	});
}
ListViewObj.prototype.init = function() {
	var t = this;
	t.setupCollapsableMenus();
	t.setupTabbedLists();

	$(window).on('resize', function() {t.setupTabbedLists();});
	$(window).on('orientationchange', function() {t.setupTabbedLists();});
}
ListViewObj.prototype.setupCollapsableMenus = function() {
	$('ul.list-view.collapsable > li > .content').click(function(e) {
		e.preventDefault();
		var plusMinusIcon = $('.list-view-icons span', this).last();
		if ($(this).hasClass("expanded")) {
			$(this).removeClass("expanded").siblings('ul').first().slideUp();
			plusMinusIcon.removeClass('icon-minus').addClass('icon-plus');
		}
		else {
			$(this).addClass("expanded").siblings('ul').first().slideDown();
			plusMinusIcon.removeClass('icon-plus').addClass('icon-minus');
		}
	});
}
ListViewObj.prototype.setupTabbedLists = function() {
	var t = this,
		tabbedListEl = $('ul#tabbed-list-view');
		tabbedListLiEls = tabbedListEl.children("li"),
		tabbedListNavAEls = $('#tabbed-list-view-nav a'),
		tabbedListNavAElsWidth = tabbedListNavAEls.first().width(),
		tabbedListNavArrow = $("#tabbed-list-view-nav-arrow"),
		ww = tabbedListLiEls.first().width();

	tabbedListNavArrow.css({
		left: tabbedListNavAElsWidth / 2
	});
	$.each(tabbedListLiEls, function() {
		$(this).css({
			left: (tabbedListLiEls.index(this) * ww) + "px"
		});
	});
	tabbedListNavAEls.click(function(e) {
		e.preventDefault();
		$(tabbedListNavAEls).removeClass("on");
		$(this).addClass("on");
		tabbedListEl.removeClass().addClass("slide-" + tabbedListNavAEls.index(this));
		tabbedListNavArrow.animate({
			left: (tabbedListNavAElsWidth / 2) + (tabbedListNavAElsWidth * tabbedListNavAEls.index(this))
		}, { queue: false, duration: 200 });
	});
}
FormObj.prototype.init = function() {
	var t = this;
	t.renderProgressDotted();
	$(window).on('resize', function() {t.renderProgressDotted();});
	$(window).on('orientationchange', function() {t.renderProgressDotted();});
}
FormObj.prototype.renderProgressDotted = function() {
	var t = this;
	$.each($('.progress-dotted'), function() {
		var completedRatioParts = $(this).data("completed").split("/"),
			newLeft = 0,
			ww = $(this).width(),
			dotSpacing = Math.round((ww - completedRatioParts[1] * t.progressDottedDotWidth) / (completedRatioParts[1] - 1)),
			leftoverPixels = ww - (dotSpacing * (completedRatioParts[1] - 1)  + t.progressDottedDotWidth * completedRatioParts[1]),
			labelEl = $('.progress-dotted-label', this),
			labelLeft = t.progressDottedDotWidth * (completedRatioParts[0] - 0.5) + dotSpacing * (completedRatioParts[0] - 1) - parseInt(labelEl.width()) / 2,
			output = "<div class='progress-dotted-bg'>&nbsp;</div><ul>";
		for (var i = 0; i < completedRatioParts[1]; i++) {
			var addedClass = (i == completedRatioParts[0] - 1 ? " class='on'" : ""),
				addedStyle = "",
				addedPixel = 0;
			if (i != 0) {
				if (leftoverPixels < 0) {
					addedPixel = -1;
					leftoverPixels++;
				}
				if (leftoverPixels > 0) {
					addedPixel = 1;
					leftoverPixels--;
				}
				newLeft += (dotSpacing + addedPixel + t.progressDottedDotWidth);
				addedStyle = " style='left:" + (newLeft) + "px;'"
			}
			output += "<li" + addedClass + addedStyle + ">&nbsp;</li>";
		}
		output += "</ul>";
		if (labelLeft < 0) labelLeft = 0;
		if (labelLeft > ww - labelEl.width()) labelLeft = ww - labelEl.width();
		labelEl.css({
			left: labelLeft
		});
		$('ul', this).remove();
		$(this).prepend(output);
	});
}
MapObj.prototype.init = function(args) {
	var t = this;
	t.view = args.view;
	t.setupMap(args);
	t.setupMarkerLinks();

	$(window).on('resize', function() {
		google.maps.event.trigger(t.map, 'resize');
		t.resetMarkerBounds();
	});
}
MapObj.prototype.setupMap = function(args) {
	var t = this;
	if (navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition(function(position) {
    		//success
    		t.userPosition = position;
    		t.initLat = position.coords.latitude;
    		t.initLng = position.coords.longitude;
    		t.setupMapView();
    		args.markers.push({
    			id: "theCaptain",
    			icon: t.userIcon,
	            lat: position.coords.latitude, 
	            lng: position.coords.longitude
    		});
    		t.addMarkers(args.markers);
    	}, function() {
    		//Errors
    		t.setupMapView();
    		t.addMarkers(args.markers);
    	});
    }
    else {
    	t.setupMapView();
    	t.addMarkers(args.markers);
    }
}
MapObj.prototype.setupMapView = function() {
	var t = this,
		mapOptions = {
			zoom: 4,
			center: new google.maps.LatLng(t.initLat, t.initLng),
			mapTypeId: google.maps.MapTypeId.ROADMAP
		},
		appContentEl = $("#app-content"),
		mapCanvasWrapperEl = $('#map-canvas-wrapper'),
		wh = $(window).height(),
		contentBottomPosition = appContentEl.height();

	$(mapCanvasWrapperEl).html('<div id="map-canvas"></div>');

	if (t.view == "fullView") {
		$(appContentEl).css({
			height: "100%"
		});
		mapCanvasWrapperEl.css({
			height: "100%"
		});
	}
	if (t.view == "listView") {
		$(appContentEl).css({
			height: wh - mapCanvasWrapperEl.height() - appContentEl.offset().top,
			"overflow-x" : "hidden",
			"overflow-y" : "scroll"
		})
		//add padding onto the body to fix issues with the map covering up list items
		if (contentBottomPosition > wh) {
			$("body").css({
				marginBottom: mapCanvasWrapperEl.height()
			});
		}
		if (contentBottomPosition < wh && (wh - contentBottomPosition) < mapCanvasWrapperEl.height()){
			$("body").css({
				marginBottom: mapCanvasWrapperEl.height() - (wh - contentBottomPosition)
			});
		}
	}

	t.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}
MapObj.prototype.addMarkers = function(markersArray) {
	var t = this;

	for (var i in markersArray) {
		var	markerLatlng = new google.maps.LatLng(markersArray[i].lat, markersArray[i].lng),
			marker = new google.maps.Marker({
				visible: (markersArray[i].visible ? markersArray[i].visible : false),
				position: markerLatlng,
				icon: (markersArray[i].icon ? markersArray[i].icon : t.defaultIcon),
				map: t.map
			}),
			distanceToUser = t.getDistanceToUser;
		if (markersArray[i].contentString) {
			var infowindow = new google.maps.InfoWindow;
			t.bindInfoWindowToMarker(marker, markersArray[i].contentString, infowindow);
		}
		t.markers.push({"id": markersArray[i].id, "marker": marker, "distanceToUser" : distanceToUser});
	}

	google.maps.event.addListenerOnce(t.map, 'idle', function(){
		if (t.view == "listView") {
			$("a[data-map-id]").first().click();
		}
		else {
			t.showMarkers();
		}
	});
}
MapObj.prototype.showMarkers = function(id) {
	var t = this,
		mapBounds = new google.maps.LatLngBounds();
	for (var i in t.markers) {
		if (!isNaN(id)) {
			t.markers[i].marker.setVisible(false);
			if (t.markers[i].id == id) {
				t.markers[i].marker.setVisible(true);
				t.map.setCenter(t.markers[i].marker.position);
				t.map.setZoom(14);
				google.maps.event.trigger(t.markers[i].marker, 'click');
			}
		}
		else {
			t.markers[i].marker.setVisible(true);
			mapBounds.extend(t.markers[i].marker.position);
		}
	}
	if (isNaN(id)) {
		t.map.fitBounds(mapBounds);
	}
}
MapObj.prototype.resetMarkerBounds = function() {
	var t = this,
		mapBounds = new google.maps.LatLngBounds();
	for (var i in t.markers) {
		if (t.markers[i].marker.getVisible() == true) {
			mapBounds.extend(t.markers[i].marker.position);
		}
	}
	t.map.fitBounds(mapBounds);
}
MapObj.prototype.setupMarkerLinks = function() {
	var t = this
		listViewMarkerLinks = $("a[data-map-id]");

	listViewMarkerLinks.click(function(e) {
		e.preventDefault();
		$('.icon-map-dot').hide();
		$('.icon-map-dot', this).show();
		t.showMarkers($(this).data("map-id"));
	});
}
MapObj.prototype.bindInfoWindowToMarker = function(marker, contentString, infowindow) {
	var t = this;
	google.maps.event.addListener(marker, 'click', function() {
		if (t.openInfowindow != null) t.openInfowindow.close();
		t.openInfowindow = infowindow;
		infowindow.setContent(contentString);
		infowindow.open(t.map, marker);
	});
}
MapObj.prototype.getDistanceToUser = function() {
	var t = this;
	if (!t.userPosition) {
		return "";
	}
	else {
		return "2 miles away";
	}
}
MapObj.prototype.rad = function(x) {return x*Math.PI/180;}
MapObj.prototype.distHaversine = function(p1, p2) {
  var t = this;
  var R = 6371; // earth's mean t.radius in km
  var dLat  = t.rad(p2.lat - p1.lat);
  var dLong = t.rad(p2.lng - p1.lng);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(t.rad(p1.lat)) * Math.cos(t.rad(p2.lat)) * Math.sin(dLong/2) * Math.sin(dLong/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;

  return d.toFixed(3);
}