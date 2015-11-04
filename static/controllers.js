'use strict';

var controllers = angular.module('controllers', []);

controllers.controller('map_controller', ['$scope', '$http', 'spinnerService', function($scope, $http, spinnerService) {
	var map_canvas = document.getElementById('map-canvas');
	$scope.map = null;
	$scope.markers = [];
	$scope.polygons = [];

	$scope.buildings = [];
	$scope.custom_buildings = [];
	$scope.points = 100;

	function create_map()
	{
		var map_options = {
			center: new google.maps.LatLng(-29.7959629,-51.1545172,17),
			zoom: 17,
			panControl: false,
			mapTypeControl: false,
			zoomControlOptions: { style: google.maps.ZoomControlStyle.SMALL, position: google.maps.ControlPosition.RIGHT_TOP }
		};

		$scope.map = new google.maps.Map(map_canvas, map_options);

		var drawingManager = new google.maps.drawing.DrawingManager({
			drawingMode: google.maps.drawing.OverlayType.MARKER,
			drawingControl: true,
			drawingControlOptions: {
				position: google.maps.ControlPosition.TOP_CENTER,
				drawingModes: [
					google.maps.drawing.OverlayType.POLYGON,
					google.maps.drawing.OverlayType.CIRCLE,
					google.maps.drawing.OverlayType.POLYLINE,
					google.maps.drawing.OverlayType.RECTANGLE
				]
			},
			circleOptions: {
				fillColor: '#ffff00',
				fillOpacity: 1,
				strokeWeight: 5,
				clickable: false,
				editable: true,
				zIndex: 1
			}
		});

		drawingManager.setMap($scope.map);

		google.maps.event.addListener(drawingManager,'polygoncomplete',function(polygon) {
			var j = polygon.getPath().j;
			var str = '';
			for (var i = 0; i < j.length; i++)
			{
				str += j[i].lat() + ' ' + j[i].lng() + ', ';
			}
			str += j[0].lat() + ' ' + j[0].lng();
			var poly = 'POLYGON(('+ str + '))';

			$http.post('/buildings/', {'polygon': poly})
				.success(function(data) {
					$scope.custom_buildings.push({
						polygon: polygon,
						contains: data.contains,
						intersects: data.intersects
					})
				});
		});
	}

	function create_marker(lat, lng)
	{
		var marker = new google.maps.Marker({
			map: $scope.map,
			position: new google.maps.LatLng(lat, lng),
			visible: true,
		});

		$scope.markers.push(marker);
	}

	function clear_markers()
	{
		for (var i = 0; i < $scope.markers.length; i++)
		{
			$scope.markers[i].setMap(null);
		}

		$scope.markers = [];
	}

	function create_polygon(poly)
	{
		var p = new google.maps.Polygon({
			paths: poly.points,
			strokeColor: '#' + poly.stroke_color,
			strokeOpacity: poly.stroke_opacity,
			strokeWeight: poly.stroke_weight,
			fillColor: '#' + poly.fill_color,
			fillOpacity: poly.fill_opacity,
			//editable: true
		});

		p.setMap($scope.map);

		$scope.polygons.push(p);
	}

	function clear_polygons()
	{
		for (var i = 0; i < $scope.polygons.length; i++)
		{
			$scope.polygons[i].setMap(null);
		}

		$scope.polygons = [];
		$scope.buildings = [];
	}

	function clear_custom_polygons()
	{
		for (var i = 0; i < $scope.custom_buildings.length; i++)
		{
			$scope.custom_buildings[i].polygon.setMap(null);
		}

		$scope.custom_buildings = [];
	}

	function load_points(data)
	{
		for (var i = 0; i < data.results.length; i++)
		{
			create_marker(data.results[i][0], data.results[i][1]);
		}
	}

	function load_buildings()
	{
		$http.get('/buildings/')
			.success(function(data) {
				for (var i = 0; i < data.results.length; i++)
				{
					create_polygon(data.results[i]);
					$scope.buildings.push(data.results[i]);
				}
			})
			.error(function(error) {
				console.log(error);
			});
	}

	$scope.generate = function()
	{
		spinnerService.show('g_spinner');
		$http.post('/points/', {'points': $scope.points})
			.success(function(data) {
				clear_markers();
				clear_polygons();
				clear_custom_polygons();
				load_points(data);
				load_buildings();
				spinnerService.hide('g_spinner');
			})
	}

	$scope.delete_polygon = function(index)
	{
		$scope.custom_buildings[index].polygon.setMap(null);
		$scope.custom_buildings.splice(index, 1);
	}

	$http.get('/points/')
		.success(function(data) {
			load_points(data);
		});

	load_buildings();
	create_map();
}]);
