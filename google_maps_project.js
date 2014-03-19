$(function() { 
	
	var titleArry = []; //titles
	var authorArry = []; //authers
	var latsArry = []; //glats
	var lonsArry = []; //glons
	var idsArry = []; //ids
	var flipArry = []; //flipped
	var thumbsArry = []; //thumbs
	var lucyArry = []; //lucy
	var markers = [];
  	var urlAll = 'http://api.kogeto.com/rest/v1/?method=looker.map.getAll';
  	var markerCluster = null;
  	var loading = true;
  	var isOpen = false;
	
	$.ajax({
        url: urlAll,
		dataType: 'json',
    	data: { get_param: 'value' },
        type:'GET',
        success: function (data) {
	        	$.each(data, function(index, element) {
	        	latsArry.push(element.lat);
		        lonsArry.push(element.long);
		        titleArry.push(element.title);
		        authorArry.push(element.author);
		        flipArry.push(element.flipped);
		        var ids = (element.id).split('/')[1];
		        idsArry.push(ids);  
		        thumbsArry.push(element.thumbnail);
		        lucyArry.push(element.lucy);          
	        });
        },
		error: function(jqXHR, textStatus, errorThrown) {}
	});
	
  	function ajaxCall(urlAll) {
	    return $.ajax({
		       	url: urlAll,
				dataType: 'json',
	    		data: { get_param: 'value' },
	       		type:'GET',
	        	success: function (data) {
		        	$.each(data, function(index, element) {
		        	latsArry.push(element.lat);
			        lonsArry.push(element.long);
			        titleArry.push(element.title);
			        authorArry.push(element.author);
			        var ids = (element.id).split('/')[1];
			        idsArry.push(ids);   
			        thumbsArry.push(element.thumbnail);  
			        lucyArry.push(element.lucy);        
	        	});
        	},
		error: function(jqXHR, textStatus, errorThrown) {}
		});
	}

	function setAllMap(map) {
	  for (var i = 0; i < markers.length; i++) {
	    markers[i].setMap(map);
	  }
	}
	
	function clearMarkers() {
	  setAllMap(null);
	}
	
	$(".feedall").click(function(){
		loading = true;
    	loadingScreen();
		deleteMarkers();
    	ajaxCall("http://api.kogeto.com/rest/v1/?method=looker.map.getAll");
    	$(this).addClass('active');
    	$(this).siblings().removeClass('active');
	});
	
	$(".feedfeatured").click(function(){
		loading = true;
    	loadingScreen();
		deleteMarkers();
    	ajaxCall("http://api.kogeto.com/rest/v1/?method=looker.map.getFeatured");
    	$(this).addClass('active');
    	$(this).siblings().removeClass('active');
	});

	$(".feedpopular").click(function(){
		loading = true;
    	loadingScreen();
		deleteMarkers();
    	ajaxCall("http://api.kogeto.com/rest/v1/?method=looker.map.getMostPopular");
    	$(this).addClass('active');
    	$(this).siblings().removeClass('active');
	});
	
	$(".feedrecent").click(function(){
		loading = true;
    	loadingScreen();
		deleteMarkers();
	    ajaxCall("http://api.kogeto.com/rest/v1/?method=looker.map.getMostRecent");
	    $(this).addClass('active');
	    $(this).siblings().removeClass('active');
	});
	
	function deleteMarkers() {
		markerCluster.clearMarkers();
	  	clearMarkers();
	  	latsArry = []; //glats
		lonsArry = []; //glons
		titleArry = []; //titles
		authorArry = []; //authers
		idsArry = []; //ids
		thumbsArry = []; 
		lucyArry = []; 
	 	markers = [];
	}
	
	function loadingScreen() {
		if (loading == true){
			$('.loading').show();
		} else {
			$('.loading').hide();
		}
	};
      
	var map;
	var infowindow = null;
	  
	function initialize() {
	var mapOptions = {
		zoom: 2,
		center: new google.maps.LatLng(20.721217,10.002284),
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControlOptions: {
      		mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID]
    	},
		minZoom:2
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	var oms = new OverlappingMarkerSpiderfier(map, {markersWontMove: true, markersWontHide: true, keepSpiderfied: true});
	var omsTruth = false;
	
	var infowindow = new google.maps.InfoWindow();
	
	// iterate through all dotspots and assing info to markers
	for (var i = 0; i < idsArry.length ; i++) {
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(latsArry[i],lonsArry[i]), 
			icon: "http://www.kogeto.com/images/geo_icon_o.png",
			markInfo: '<div class="clear hook"><iframe src="http://player.kogeto.com/video/'+idsArry[i]+'" width="675" height="302" frameborder="0" scrolling="no"></iframe></div>',
			markInfoLucy: '<div class="clear hook"><iframe src="http://player.kogeto.com/video/'+idsArry[i]+'" width="675" height="337" frameborder="0" scrolling="no"></iframe></div>',
			thumb: '<div class="clear hook preview"><img src="'+thumbsArry[i]+'" /><h2 class="clear">'+titleArry[i]+'</h2><h4 class="clear">by '+authorArry[i]+'</h4></div>',
			flipit: flipArry[i],
			isLucy: lucyArry[i]
		});
		oms.addMarker(marker);
		markers.push(marker);
		loading = false;
		isOpen = false;
		
        (function(marker, i) {
            // add click event
            if (isOpen == false){
            
            google.maps.event.addListener(marker, 'click', function() {
            	
            	if (infowindow) {
    				infowindow.close();
    				isOpen = false;
				}
				
                infowindow = new google.maps.InfoWindow();
                isOpen = true;
                if (marker.isLucy == 1){
                infowindow.setContent(marker.markInfoLucy);
                } else {
                infowindow.setContent(marker.markInfo);
                }
                infowindow.open(map, marker);
                $('#map-canvas div.gm-style-iw').addClass("playersize");
                
                map.setCenter(marker.getPosition());
                oms.addListener('click', function(marker, event) {
					infowindow.setContent(marker.content);	
					infowindow.open(map, marker);
				});
				oms.addListener('spiderfy', function(marker) {
			  		infowindow.close();
				});
				google.maps.event.addListener(infowindow,'closeclick',function(){
		        	isOpen = false;
				});

            });
            }
            
            
            google.maps.event.addListener(marker, 'mouseover', function() {
            	if (isOpen == false){
            	if (infowindow) {
    				infowindow.close();
    				isOpen = false;
				}
				
				                
                infowindow = new google.maps.InfoWindow();
                
                infowindow.setContent(marker.thumb);
                infowindow.open(map, marker);
                $('#map-canvas div.gm-style-iw').addClass("thumbsize");
                $( ".gm-style-iw" ).parent().addClass("drill");
                
                if (marker.flipit == 1){
                $('.preview').addClass('flipped');
                }
                

                oms.addListener('hover', function(marker, event) {
					infowindow.setContent(marker.content);	
					infowindow.open(map, marker);
				});
				oms.addListener('spiderfy', function(marker) {
			  		infowindow.close();
				});
				}
            });

            google.maps.event.addListener(marker, 'mouseout', function() {
            	if (isOpen == false){
	            	if (infowindow) {
	    				infowindow.close();
					}
				}

            });

        })(marker, i);


 	}
 	        
 	loadingScreen();

	var mcOptions = {gridSize: 30, maxZoom: 20};
	
	markerCluster = new MarkerClusterer(map, markers, mcOptions);
	google.maps.event.addListener(markerCluster, 'click', function(cluster) {
		infowindow.close();
		isOpen = false;
	});
	
	google.maps.event.addListener(map, 'click', function(){
        infowindow.close();
        isOpen = false;
    });
}

$(document).ajaxStop(initialize);
	

});