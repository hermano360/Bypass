$(document).foundation()

  require( [
    "esri/urlUtils",
    "esri/config",
    "esri/map",
    "esri/graphic",
    "esri/dijit/Search",
    "esri/IdentityManager",
    "esri/tasks/RouteTask",
    "esri/tasks/RouteParameters",
    "esri/tasks/RouteResult",
    "esri/tasks/FeatureSet",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/geometry/Polyline",
    "esri/geometry/Extent",
    "esri/dijit/Geocoder",
    "esri/Color",
    "dojo/_base/array",
    "dojo/on",
    "dojo/dom",
    "dijit/registry",
    "dojo/query",
    "esri/geometry/webMercatorUtils",
    "esri/geometry/Circle",
    "esri/geometry/Point",
    "dojo/request",
    "dojo/request/xhr",
    "dojo/ready",
    "esri/renderers/HeatmapRenderer",
    "esri/tasks/geometry",
    "esri/units",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/form/HorizontalSlider",
    "dijit/form/HorizontalRuleLabels"
    ], function (
      urlUtils, esriConfig, Map, Graphic, Search, esriId, RouteTask, RouteParameters, RouteResult,
      FeatureSet, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Polyline, Extent, Geocoder,
      Color, array, on, dom, registry, djQuery, webMercatorUtils, Circle, Point, request, xhr,ready,HeatmapRenderer
      )
    {

      var map, routeTask, routeParams, routeParamsNormal, routes = [];
      var barriers = [], routeStops = [{},{}], myLocation = [];
      var irreleventBarriers = [];
      var stopSymbol, barrierSymbol, customRouteSymbol, routeSymbols, polygonBarrierSymbol;
      var mapOnClick_addStops_connect, mapOnClick_addBarriers_connect, mapOnClick_addPolygonBarriers_connect, mapOnClick_testCrime_connect, mapOnClick_mapIndex_connect, myLocationToAddress_connect;
      var mapOnClick_addInitialStop_connect;
      var mapOnClick_addDestinationStop_connect;
      var mapOnClick_addStartStop_connect;

      var stopCounter = 0;
      var barrierToggle = 0;
      var sortedData;
      var plotCount = 0;
      var routeResults;
      var crimeArray = [];
      var globalxydata;
      var severityAll = [];
      var weightedSpatialArray;
      var phoneNumber;
      var businessLocations;
      var footTrafficArray;
      var globalToken;
      var sRoute;
      var irreleventBarriersLimit=0;
      var routeCheckerStop;
      var barrierVisibility = false;
      var formatedData;
      var densityArray;
      var sRouteWB;
      var normalRoute;
      var bypassRoute;
      var chosenRouteDirections;
      var normalRouteDirections;
      var bypassRouteDirections;

      var myLocationAddress;
      var whichStopAddressInput = "initial";
      var filteredPoints = [];
      var footTrafficSquares = [];
      var normalizedArray;
      var normalizedArrayGraphics = [];
      var allLocations;
      var rawDataPointsGraphics = [];

      var filterParametersCollector = ["",[""],""];
      var crimesBinary = false;
      var featuresBinary = false;
      var rawCrimesGraphics = [];
      var rawFeaturesGraphics = [];
      var crimePointsArray = [];
      var filteredCrimeLocations = [];
      var filteredSexOffendersLocations = [];
      var filteredWifiLocations = [];
      var filteredBusinessLocations = [];
      var bypassTimeDistance;
      var normalTimeDistance;
      var newRouteAllowed = true;
      var initialCenterPoint;
      var initialAddress;
      var startPoint;
      var endPoint;
      var myLocationAvailable = false;


      var authdata = {client_id: '2FiTpg1kQIhDPS1H', client_secret: '926550d14c5e4fe9b39fc25229654ce7', grant_type: 'client_credentials', expiration: '1440'}

      var walkModeUrl = "";
      walkModeUrl = "travelMode={\"attributeParameterValues\":[{\"parameterName\":\"Restriction Usage\",\"attributeName\":\"Walking\",\"value\":\"PROHIBITED\"},{\"parameterName\":\"Restriction Usage\",\"attributeName\":\"Preferred for Pedestrians\",\"value\":\"PREFER_LOW\"},{\"parameterName\":\"Walking Speed (mph)\",\"attributeName\":\"TravelTime\",\"value\":5}],\"description\":\"Follows paths and roads that allow pedestrian traffic and finds solutions that optimize travel time. The walking speed is set to 5 miles per hour.\",\"impedanceAttributeName\":\"Miles\",\"simplificationToleranceUnits\":\"esriMeters\",\"uturnAtJunctions\":\"esriNFSBAllowBacktrack\",\"restrictionAttributeNames\":[\"Preferred for Pedestrians\",\"Walking\"],\"useHierarchy\":false,\"simplificationTolerance\":2,\"timeAttributeName\":\"TravelTime\",\"distanceAttributeName\":\"Miles\",\"type\":\"WALK\",\"id\":\"caFAgoThrvUpkFBW\",\"name\":\"Walking Time\"}&";


      var SantaMonicaCoordinates= {
        xmin:-13193161.542197285, //western-most x-coordinate (corresponds to GPS)
        xmax:-13185441.402340494, //eastern-most x-coordinate (corresponds to GPS)
        ymax:4035246.5784217017,  //northern-most y-coordinate (corresponds to GPS)
        ymin:4028520.119932615,  //southern-most y-coordinate (corresponds to GPS)
        blockWidthXY: 187.02, //This is what correponds most closely to about 300' in terms of xy coordinates
        latmax:  webMercatorUtils.xyToLngLat(-13193161.542197285, 4035246.5784217017, true)[1],
        longmin: webMercatorUtils.xyToLngLat(-13193161.542197285, 4035246.5784217017, true)[0],

        latmin:  webMercatorUtils.xyToLngLat(-13185441.402340494, 4028520.119932615, true)[1],
        longmax: webMercatorUtils.xyToLngLat(-13185441.402340494, 4028520.119932615, true)[0]

      }

      map = new Map("map", {
        basemap: "streets",
        center: [-118.49132, 34.01455],
        zoom: 14,
        smartNavigation: false, //by adding this, the scroll mouse goes in and out, rather than up and down. perhaps the other way is better though, idk
        slider:false  
      });






      ready(function() {

        map.on("extent-change", addDesignatedStop);
        inputInitialAddress();
        var endGeocoderInitial = new Geocoder({
          autoComplete:true,
          map: map,
        }, dom.byId("destinationAddressInitial"));
        
        

        endGeocoderInitial.startup();
        endGeocoderInitial.autoNavigate = false;
        endGeocoderInitial.on("select", function(results){
          $("#destinationAddressInitial_input").val(results.result.name.replace("California", "CA"));
          $("#destinationAddress_input").val(results.result.name.replace("California", "CA"));

          $('#solveRoute').css("visibility", "visible");
          var points = webMercatorUtils.xyToLngLat(results.result.feature.geometry.x, results.result.feature.geometry.y, true);
          var instancePoint = new Point(points[0],points[1]);
          map.centerAndZoom(instancePoint,16);
          map.graphics.remove(routeStops.pop());
          routeStops.push(map.graphics.add(new esri.Graphic(instancePoint,stopSymbol)));
        });





        var startGeocoder = new Geocoder({
          autoComplete:true,
          map: map,
        }, dom.byId("startAddress"));

        startGeocoder.startup();
        startGeocoder.autoNavigate = false;
        startGeocoder.on("select", function(results){
          clearRoutes();
          $('.bottom-route-bar').css("display","none");
          $("#startAddress_input").val(results.result.name.replace("California", "CA"));
          var points = webMercatorUtils.xyToLngLat(results.result.feature.geometry.x, results.result.feature.geometry.y, true);
          var instancePoint = new Point(points[0],points[1]);
          startPoint = instancePoint;
          map.graphics.remove(routeStops.shift());
          routeStops.unshift(map.graphics.add(new esri.Graphic(instancePoint,startSymbol)));
          navigationExtents();
          if(routeStops[0].geometry && routeStops[1].geometry){
            $('#solveRoute').css("visibility", "visible");
          }
          // var minx=map.extent.xmin;
          // var miny=map.extent.ymin;
          // var maxx=map.extent.xmax;
          // var maxy=map.extent.ymax;
          // xyUnits = webMercatorUtils.lngLatToXY(routeStops[0].geometry.x, routeStops[0].geometry.y);
          // if(map.extent.xmin>xyUnits[0]){
          //   minx = xyUnits[0] - .20 * (map.extent.xmax-xyUnits[0]);
          // } else if(map.extent.xmax<xyUnits[0]){
          //   maxx = xyUnits[0] + .20 * (xyUnits[0]-map.extent.xmin);
          // }
          // if(map.extent.ymin>xyUnits[1]){
          //   miny = xyUnits[1] - .20 * (map.extent.ymax-xyUnits[1]);

          // } else if(map.extent.ymax<xyUnits[1]){
          //   maxy = xyUnits[1] + .20 * (xyUnits[1]-map.extent.ymin);
          // }
          // var newExtent = new Extent({xmin:minx,ymin:miny,xmax:maxx,ymax:maxy,spatialReference:{wkid:102100}});
          // map.setExtent(newExtent);
        });

        var endGeocoder = new Geocoder({
          autoComplete:true,
          map: map,
        }, dom.byId("destinationAddress"));

        endGeocoder.startup();
        endGeocoder.autoNavigate = false;
        endGeocoder.on("select", function(results){
          var points = webMercatorUtils.xyToLngLat(results.result.feature.geometry.x, results.result.feature.geometry.y, true);
          var instancePoint = new Point(points[0],points[1]);
          map.graphics.remove(routeStops.pop());
          routeStops.push(map.graphics.add(new esri.Graphic(instancePoint,stopSymbol)));
          clearRoutes();
          navigationExtents();
          $('.bottom-route-bar').css("display","none");
          $("#destinationAddress_input").val(results.result.name.replace("California", "CA"));
          
          
          if(routeStops[0].geometry && routeStops[1].geometry){
            $('#solveRoute').css("visibility", "visible");
          }

        // var minx=map.extent.xmin;
        // var miny=map.extent.ymin;
        // var maxx=map.extent.xmax;
        // var maxy=map.extent.ymax;
        // xyUnits = webMercatorUtils.lngLatToXY(routeStops[1].geometry.x, routeStops[1].geometry.y);
        // if(map.extent.xmin>xyUnits[0]){
        //   minx = xyUnits[0] - .20 * (map.extent.xmax-xyUnits[0]);
        // } else if(map.extent.xmax<xyUnits[0]){
        //     maxx = xyUnits[0] + .20 * (xyUnits[0]-map.extent.xmin);
        //   }
        //   if(map.extent.ymin>xyUnits[1]){
        //     miny = xyUnits[1] - .20 * (map.extent.ymax-xyUnits[1]);
        //   } else if(map.extent.ymax<xyUnits[1]){
        //     maxy = xyUnits[1] + .20 * (xyUnits[1]-map.extent.ymin);
        //   }
        //   var newExtent = new Extent({xmin:minx,ymin:miny,xmax:maxx,ymax:maxy,spatialReference:{wkid:102100}});
        //   map.setExtent(newExtent);

        });



      //$("#startAddress_input").attr("placeholder","Type or Click on Map for Start");
      //$("#destinationAddress_input").attr("placeholder","Type or Click on Map for Destination");
      $("#destinationAddressInitial_input").attr("placeholder","Click on Map or Type Address!");




      //geocoder.on("select", showLocation);

      function showLocation(evt) {
  map.graphics.clear();
  var point = evt.result.feature.geometry;
  var symbol = new SimpleMarkerSymbol()
    .setStyle("square")
    .setColor(new Color([255,0,0,0.5]));
  var graphic = new Graphic(point, symbol);
  map.graphics.add(graphic);

  map.infoWindow.setTitle("Search Result");
  map.infoWindow.setContent(evt.result.name);
  map.infoWindow.show(evt.result.feature.geometry);
};





        xhr.get("cached_danger_influences.csv", { //uploading csv data
          handleAs: "text",
        }).then(function(data) {
          globalvariable = data.replace(/\n/g, "," ).split(",");
          formatedData = formatGlobal(globalvariable);
          densityArray = dangerAlgorithm(formatedData);
          //mapAllIndices(densityArray);

          xhr.get("SMpopdataFormat1.csv", {
            handleAs: "text",
          }).then(function(data) {

            businessLocations = formatBusinesses(data.split(","));


          footTrafficArray = footTrafficCalculator(businessLocations);
          //adjustableMapIndices(footTrafficArray); //gridded out array of foottraffic estimate
          normalizedArray = crimeNormalizer(densityArray, footTrafficArray);
          mapAllIndices(normalizedArray);
          map.on("extent-change", resetBarriersPoints);
        });

        });

        xhr.get("cached_danger_influences.csv", { //uploading csv data
          handleAs: "text",
        }).then(function(data) {
          globalvariable = data.replace(/\n/g, "," ).split(",");
          formatedData = formatGlobal(globalvariable);
          densityArray = dangerAlgorithm(formatedData);
          //mapAllIndices(densityArray);

        //   xhr.get("2015-PART_I_AND_II_CRIMES.csv", {
        //     handleAs: "text",
        //   }).then(function(data) {

        //     var crime2015 = data.replace(/\n/g,"?" ).replace(/\"/g,'').split("?");
        //     geocodexy(crime2015);
        // });

        });



        xhr.get("CompleteDataSet.csv", {
          handleAs: "text",
        }).then(function(data) {

          allLocations = formatCompleteDataset(data.replace(/\n/g, "," ).split(","));
          //console.log(allLocations);
          //plotFilteredData(["RawData",{crime: ["Assault","Burglary"],pointsOfInterest: ["Wifi Location","Sex Offender"],business: ["School"]},"Last Year"]);
        });

        $.ajax({
          type: 'POST',
          url: 'https://www.arcgis.com/sharing/rest/oauth2/token/',
          data: authdata,

          success: function (results, textStatus, xhr) {

            var tokenObject = JSON.parse(results);
            globalToken = tokenObject.access_token;
            //console.log(globalToken);
            var tokenParameters = {expires: (Date.now() + 86400).toString(),server:'https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World', ssl:true, token:tokenObject.access_token, userId:authdata.client_id};

            esriId.registerToken(tokenParameters);
          },

          error: function (xhr, textStatus, errorThrown) {
            console.log("test failed");
            console.log("ERROR:" + xhr.responseText + xhr.status + errorThrown);
            return false;
          }
        });

        $("#directions-button").click( function () {
          clearRawData();
          $("#mapFormatButton option:selected").prop('selected', false);
          $("#dataSetButton option:selected").prop('selected', false);
          $("#timeFrameButton option:selected").prop('selected', false);


          if($('#directions-button').hasClass("directions-button-inactive")){
            console.log("direction btn was inactive");
            $(".filter-options-nav-bar").css("display","none");
            //$(".directions-nav-bar").css("display","block");
            $('#startAddress').css('display',"block");
            $('#destinationAddress').css('display',"block");
            if($('#solveRoute').text()==="Go!"){
              $('#solveRoute').css("visibility","hidden");
              $('#directionsDisplay').empty();
            } else {
              //$('#solveRoute').css("display","none");
            }

            activateDirections();
            deactivateFilters();
            $('#directionsDisplay').empty();
          } else {
            console.log("direction btn was active");
            if ($('#directionsDisplay').text().length != 0 ) {
              console.log("direction list was populated");
              $('#directionsDisplay').empty();
            } else{
              console.log("direction list was not populated");
              resetDirections();
            }
          }

        });

        $("#bypassLogo").click( function() {
          barrierVisibility = false;
          resetBarriers();
          clearCrimesData();
          clearFeaturesData();
          clearMyLocation();
            $("#crimesButton").html("Dangers");
            $("#crimesButton").data("crimeDisplay","none");
            $("#featuresButton").html("Safety Pts");
            $("#featuresButton").data("featuresDisplay","none");


            if ($('#directionsDisplay').text().length != 0 ) {
              console.log("direction list was populated");
              $('#directionsDisplay').empty();
            }

        });


        $("#solveRoute").click( function(){
          solveRouteClick();
        });


        $("#beginRoute").click(function() {

          $('.bottom-route-bar').css("display","none");
          if(routes.length > 1){
            map.graphics.remove(routes.shift());
          }
          $("#address-wrapper").css('display',"none");
          barrierVisibility = false;
          resetBarriers(); 
          $("#featuresButton").data("featuresDisplay","none");
          $("#crimeInfo").html("Crime Grid");
          $("#crimesButton").data("crimeDisplay","none");
          $("#crimesButton").removeClass("fa-history");
          $("#crimesButton").removeClass("fa-male");
          $("#crimesButton").removeClass("fa-warning");
          $("#crimesButton").addClass("fa-delicious");

          $("#crimesButton").addClass("iconSelected");
          $("#crimesButton").removeClass("iconUnselected");
          $("#featuresButton").addClass("iconUnselected");
          $("#featuresButton").removeClass("iconSelected");
          map.centerAndZoom(startPoint,17);


        })

        $('#startAddress').click(function() {
          whichStopAddressInput = "start";
          addDesignatedStop();


        });




        $('#startAddress_input').each(function(){
          $(this).focus(function(){
            $(this).attr("placeholder","");
          });


          $(this).blur(function(){
            $(this).attr("placeholder","Type or Choose on Map for Start");
          });

          $(this).keyup(function(){
            if($(this).val()==""){
              map.graphics.remove(routeStops.shift());
              routeStops.unshift({});
              clearRoutes();
            }
          });

        });


        $('#startAddress').keyup(function(){
          $('#solveRoute').css("visibility", "hidden");
        });

        $('#destinationAddress').click(function() {
          $("#destinationAddress_input").attr("placeholder","");
          whichStopAddressInput = "end";
          addDesignatedStop();
        });


        $('#destinationAddress_input').each(function(){
          $(this).focus(function(){
            $(this).attr("placeholder","");

            $(this).one('mouseup', function(event){
              $(this).select();
            });
          });

          $(this).blur(function(){
            $(this).attr("placeholder","Type or Choose on Map for Destination");
          });

          $(this).keyup(function(){
            if($(this).val()==""){
              map.graphics.remove(routeStops.pop());
              routeStops.push({});
              clearRoutes();
            }
          });

        });

        $('#destinationAddress_input').keyup(function(){
          $('#solveRoute').css('visibility',"hidden");
        });



////Extra textbox
$('#destinationAddressInitial').click(function() {
          $("#destinationAddressInitial_input").attr("placeholder","");
        });


        $('#destinationAddressInitial_input').each(function(){
          $(this).focus(function(){
            $(this).attr("placeholder","");

            $(this).one('mouseup', function(event){
              $(this).select();
            });
          });

          $(this).blur(function(){
            $(this).attr("placeholder","Type Address or Click on Map!");
          });

          $(this).keyup(function(){
            if($(this).val()==""){
              map.graphics.remove(routeStops.pop());
              routeStops.push({});
            }
          });

        });



/////


        $('#myLocation').click(function() {
          addMyLocationDot();
        });

        $("#resetBtn").click( function () {
          whichStopAddressInput="initial";
          chosenRouteDirections = "";
          clearStops();
          routeStops= [{},{}];

          barrierVisibility = false;
          resetBarriers();

          clearRoutes();
          clearCrimesData();
          clearFeaturesData();
          clearMyLocation();

          $("#startAddress_input").val(initialAddress);
          $('#destinationAddress_input').val("");
          $("#destinationAddressInitial").css('display',"block");
          $(".nav-bar-wrapper").css('display',"block");
          $("#address-wrapper").css('display',"none");
          $(".bottom-route-bar").css('display',"none");
          $("#destinationAddressInitial_input").val("");
          $("#destinationAddressInitial_input").attr("placeholder","Click on Map or Type Address!");
          $('#directionsDisplay').empty();
          $('#solveRoute').css("visibility", "hidden");
          $("#featureInfo").html("");
          $("#crimeInfo").html("");

          $("#crimesButton").removeClass("fa-delicious");
          $("#crimesButton").removeClass("fa-history");
          $("#crimesButton").removeClass("fa-male");
          $("#crimesButton").addClass("fa-warning");
          
          $("#featuresButton").removeClass("fa-wifi");
          $("#featuresButton").removeClass("fa-cutlery");
          $("#featuresButton").addClass("fa-shield");



          $("#featuresButton").removeClass("iconSelected");
          $("#crimesButton").removeClass("iconSelected");
          $("#featuresButton").addClass("iconUnselected");
          $("#crimesButton").addClass("iconUnselected");


          $('#BypassRoute').css('display',"none");
          $('#NormalRoute').css('display',"none");

          deactivateDirections();
          deactivateFilters();
          barrierVisibility = false;
          mapAllIndices(normalizedArray);
          clearRawData();
        });

        $("#BypassRoute").click(function () {
          chooseBypass();
          $("#BypassRoute").addClass("routeSelected");
          $("#BypassRoute").removeClass("routeUnselected");
          $("#NormalRoute").removeClass("routeSelected");
          $("#NormalRoute").addClass("routeUnselected");
          console.log(routes.length);
          if ($("#directions-button").hasClass("directions-button-active") == true) {
            if(!$('#directionsDisplay').is(':empty')){
              activateDirections();
            }
          }

        });



        $("#NormalRoute").click( function () {
          chooseNormal();
          $("#NormalRoute").removeClass("routeUnselected");
          $("#NormalRoute").addClass("routeSelected");
          $("#BypassRoute").addClass("routeUnselected");
          $("#BypassRoute").removeClass("routeSelected");
          if ($("#directions-button").hasClass("directions-button-active") == true) {
            if(!$('#directionsDisplay').is(':empty')){
              activateDirections();
            }
          }

        });

        $("#mapCrimeIndex").click( function () {
          mapIndex();
        });





      });

      function activateFilters() {
        $("#filter-button").removeClass("filter-button-inactive");
        $("#filter-button").addClass("filter-button-active");
      }
      function deactivateFilters() {
        $("#filter-button").removeClass("filter-button-active");
        $("#filter-button").addClass("filter-button-inactive");
      }
      function activateDirections() {
        $("#directions-button").removeClass("directions-button-inactive");
        $("#directions-button").addClass("directions-button-active");
        resetDirections()
      }
      function deactivateDirections() {
        $("#directions-button").removeClass("directions-button-active");
        $("#directions-button").addClass("directions-button-inactive");
        $('#directionsDisplay').empty();
      }

      function resetDirections() {
        $('#directionsDisplay').empty();
        var border_style = "";
        var individual_direction = "";

        if(chosenRouteDirections){
          for(var i = 1 ; i < chosenRouteDirections[0].features.length; i++)
          {
            individual_direction = chosenRouteDirections[0].features[i].attributes.text
            border_style = " style='border-bottom: 1px solid #BBBBBB' ";
            if (i == chosenRouteDirections[0].features.length-1)
            {
              individual_direction = individual_direction.replace("Finish at Location 2, ", "");
              // uppercase the first word in sentence
              individual_direction = individual_direction.charAt(0).toUpperCase() + individual_direction.slice(1);
            }

            $("#directionsDisplay").append("<div class='row'" + border_style + "><div class='large-12 columns dynamicDirectionsRow'>" + individual_direction + "</div></div>");

          };
        }
        else {
          deactivateDirections()
        }
      }

      // function disableNewRouteBtn() {
      //   $("#resetBtn").addClass("disabled");
      // }

      // function enableNewRouteBtn() {
      //   $("#resetBtn").removeClass("disabled");
      // }

      function disableStartEndTextboxes() {
        $("#startAddress").attr("disabled", true);
        $("#destinationAddress").attr("disabled", true);
      }

      function enableStartEndTextboxes() {
        $("#startAddress").removeAttr("disabled");
        $("#destinationAddress").removeAttr("disabled");
      }

      function enableButtons() {
        $(".bottom-buttons").removeAttr("disabled");
        $("#myLocation").removeAttr("disabled");
      }

      function disableButtons() {
        $(".bottom-buttons").removeAttr("disabled");
        $("#myLocation").removeAttr("disabled");
      }

//9/14
$("#crimesButton").click(function(){

  $("#crimesButton").removeClass("iconUnselected");
  $("#crimesButton").addClass("iconSelected");
if($("#crimesButton").data("crimeDisplay")=="none"){
  $("#crimesButton").removeClass("iconUnselected");
  $("#crimesButton").addClass("iconSelected");
  barrierVisibility = true;

  resetBarriers(); 


  $("#crimeInfo").html("Crime Grid");
  $("#crimesButton").data("crimeDisplay","crimeGrid");
    $("#crimesButton").removeClass("fa-warning");
  $("#crimesButton").addClass("fa-delicious");
} else if($("#crimesButton").data("crimeDisplay")=="crimeGrid"){
  $("#crimesButton").removeClass("iconUnselected");
  $("#crimesButton").addClass("iconSelected");
  barrierVisibility = false;
  resetBarriers();
  crimesPlot();
  $("#crimeInfo").html("Crime in Last 24 Hours");
  $("#crimesButton").data("crimeDisplay","crimePoints");
  $("#crimesButton").removeClass("fa-delicious");
  $("#crimesButton").addClass("fa-history");
}else if($("#crimesButton").data("crimeDisplay")=="crimePoints"){
  $("#crimesButton").removeClass("iconUnselected");
  $("#crimesButton").addClass("iconSelected");
  clearCrimesData();
  sexOffendersPlot();
  $("#crimeInfo").html("Sex Offenders");
    $("#crimesButton").removeClass("fa-history");
  $("#crimesButton").addClass("fa-male");
$("#crimesButton").data("crimeDisplay","sexOffenders");
} else if($("#crimesButton").data("crimeDisplay")=="sexOffenders"){
  $("#crimesButton").removeClass("iconSelected");
  $("#crimesButton").addClass("iconUnselected");
  clearCrimesData();
  $("#crimeInfo").html("");
  $("#crimesButton").removeClass("fa-male");
  $("#crimesButton").addClass("fa-warning");
$("#crimesButton").data("crimeDisplay","none");
}

});



$("#featuresButton").click(function(){

    if($("#featuresButton").data("featuresDisplay")=="none"){
          $("#featuresButton").removeClass("iconUnselected");
  $("#featuresButton").addClass("iconSelected");
      clearFeaturesData();
      openBusinessPlot();
      $("#featureInfo").html("Open Restaurants/Bars");
      $("#featuresButton").data("featuresDisplay","openBusiness");
      $("#featuresButton").removeClass("fa-shield");
      $("#featuresButton").addClass("fa-cutlery");
    } else if($("#featuresButton").data("featuresDisplay")=="openBusiness"){
          $("#featuresButton").removeClass("iconUnselected");
  $("#featuresButton").addClass("iconSelected");
      clearFeaturesData();
      wifiLocationsPlot();
      $("#featureInfo").html("Wifi Locations");
      $("#featuresButton").data("featuresDisplay","wifiLocations");
      $("#featuresButton").removeClass("fa-cutlery");
      $("#featuresButton").addClass("fa-wifi");
    } else if($("#featuresButton").data("featuresDisplay")=="wifiLocations"){
          $("#featuresButton").removeClass("iconSelected");
  $("#featuresButton").addClass("iconUnselected");
      clearFeaturesData();
      $("#featureInfo").html("");
      $("#featuresButton").data("featuresDisplay","none");
      $("#featuresButton").removeClass("fa-wifi");
      $("#featuresButton").addClass("fa-shield");
    }
  });

function formatGlobal(dataz) {
var formatedglobal = [];
var rowData = new Array(4);

for(var k = 4; k < dataz.length-3; k = k+4){
  rowData[0] = dataz[k];
  rowData[1] = Number(dataz[k+1]);
  rowData[2] = Number(dataz[k+2]);
  rowData[3] = Number(dataz[k+3]);
  formatedglobal.push(rowData);
  rowData = [0,0,0,0];
}

return formatedglobal;
}

function formatBusinesses(dataz) {
var formattedBusinessArray = [];
var rowData = new Array(4);

for(var k = 2; k < dataz.length-1; k = k+2){
rowData[0] = dataz[k];
rowData[1] = Number(dataz[k+1].match(/\((.*)\;/i)[1]);
rowData[2] = Number(dataz[k+1].match(/\;(.*)\)/i)[1]);
rowData[3] = 1;

formattedBusinessArray.push(rowData);
rowData = [0,0,0,0];
}
return formattedBusinessArray;
}






//routeTask = new RouteTask("https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World");
routeParams = new RouteParameters();
routeParams.stops = new FeatureSet();
routeParams.barriers = new FeatureSet();
routeParams.polygonBarriers = new esri.tasks.FeatureSet();
routeParams.returnDirections = true;

polygonBarrierSymbol = new esri.symbol.SimpleFillSymbol();
customRouteSymbol = new SimpleLineSymbol();

routeParams.outSpatialReference = {"wkid":102100};

//routeTask.on("solve-complete", showRoute);
//routeTask.on("error", errorHandler);

      //used as the start symbol of a destination
      startSymbol = new SimpleMarkerSymbol();
      startSymbol.setAngle(0);
      startSymbol.setColor(new Color([38, 115, 0, 0.82]));
      startSymbol.setPath("M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z");
      startSymbol.setStyle(SimpleMarkerSymbol.STYLE_PATH);
      //used as the end symbol of a destination
      stopSymbol = new SimpleMarkerSymbol();
      stopSymbol.setAngle(0);
      stopSymbol.setColor(new Color([230, 0, 0, 0.82]));
      stopSymbol.setPath("M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z");
      stopSymbol.setStyle(SimpleMarkerSymbol.STYLE_PATH);



      routeSymbols = {
        "unselectedRoute": new SimpleLineSymbol().setColor(new Color([169,169,169,.75])).setWidth(5),
        "selectedRoute": new SimpleLineSymbol().setColor(new Color([140,212,204,1])).setWidth(5),
        "Route 3": new SimpleLineSymbol().setColor(new Color([255,0,255,0.5])).setWidth(5)
      };


      function inputAddress(){
        clearRoutes();
        $('#solveRoute').css("visibility","hidden");
        //$('#solveRoute').text("Get Me There Safely!");
        navigator.geolocation.getCurrentPosition(function(position){
          long = position.coords.longitude;
          lat = position.coords.latitude;
          centerpoint = new Point(long,lat);
          if(whichStopAddressInput == "start"){
            startPoint = centerpoint;
            map.graphics.remove(routeStops.shift());
            routeStops.unshift(map.graphics.add(new esri.Graphic(centerpoint,startSymbol)));
          } else if(whichStopAddressInput == "end"){
            map.graphics.remove(routeStops.pop());
            routeStops.push(map.graphics.add(new esri.Graphic(centerpoint,stopSymbol)));
          }


          $.ajax({
            type: 'POST',
            url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location="+long+"%2C+"+lat+"&distance=200&outSR=&f=pjson",
            success: function (results, textStatus, xhr) {
              var parsedResults = JSON.parse(results);
              if(whichStopAddressInput == "start"){
                $("#startAddress").val(parsedResults.address.Match_addr.replace("California","CA"));
              } else if(whichStopAddressInput == "end"){
                $("#destinationAddress").val(parsedResults.address.Match_addr);
              }
              $("#myLocation").off('click', inputAddress);

              if($('#startAddress').val() && $('#destinationAddress').val()){
                $('#solveRoute').css("visibility", "visible");
              }
            },
            error: function (xhr, textStatus, errorThrown) {
              console.log("test failed");
              console.log("ERROR:" + xhr.responseText + xhr.status + errorThrown);
              return false;
            }
          });


        });
      }




      function inputInitialAddress(){

        $("#startAddress_input").attr("placeholder","Your Location...");
        navigator.geolocation.getCurrentPosition(function(position){
          long = position.coords.longitude;
          lat = position.coords.latitude;
          initialCenterPoint = new Point(long,lat);
          $("#myLocation").css("visibility", "visible");
          myLocationAvailable = true;


          map.centerAndZoom(initialCenterPoint,14);

          $.ajax({
            type: 'POST',
            url: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location="+long+"%2C+"+lat+"&distance=200&outSR=&f=pjson",
            success: function (results, textStatus, xhr) {
              var parsedResults = JSON.parse(results);
              initialAddress = parsedResults.address.Match_addr.replace("California","CA");
              $("#startAddress_input").val(initialAddress);
            },
            error: function (xhr, textStatus, errorThrown) {
              console.log("test failed");
              console.log("ERROR:" + xhr.responseText + xhr.status + errorThrown);
              return false;
            }
          });
        });
      }


      function plotInitialStart(){
        startPoint = initialCenterPoint;
        map.graphics.remove(routeStops.shift());
        routeStops.unshift(map.graphics.add(new esri.Graphic(initialCenterPoint,startSymbol)));
        console.log(routeStops[0].geometry);
      }

      function addDesignatedStop(){


        console.log(whichStopAddressInput);
        if(whichStopAddressInput=="initial"){
          addInitialDestinationStop();
          
        } else if(whichStopAddressInput=="start"){
          removeEventHandlers();
          addStartStop();
        } else if(whichStopAddressInput=="end"){
          removeEventHandlers();

          addDestinationStop();
        } else {
          console.log("remove Event Handlers called");
          removeEventHandlers();
        }
        console.log(whichStopAddressInput);
        
      }


      function addStartStop(){
        $("#myLocation").on('click', inputAddress);
        removeEventHandlers();
        mapOnClick_addStops_connect = map.on("click", function(evt){

        $('#solveRoute').css("visibility", "hidden");
        $("#BypassRoute").css('display',"none");
        $("#NormalRoute").css('display',"none");
          clearRoutes();
          var longlat = webMercatorUtils.xyToLngLat(evt.mapPoint["x"], evt.mapPoint["y"], true);
          startPoint = new Point(longlat);
          console.log(routeStops.length);
          map.graphics.remove(routeStops.shift());
          routeStops.unshift(map.graphics.add(new esri.Graphic(startPoint,startSymbol)));
          console.log(routeStops.length);

          $.ajax({
            type: 'POST',
            url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location="+longlat[0]+"%2C+"+longlat[1]+"&distance=200&outSR=&f=pjson",
            success: function (results, textStatus, xhr) {
              var parsedResults = JSON.parse(results);
              console.log(parsedResults);
              if(parsedResults.address){

                $("#startAddress_input").val(parsedResults.address.Match_addr.replace("California", "CA"));

                if(routeStops[0].geometry && routeStops[1].geometry){
                  $('#solveRoute').css("visibility", "visible");
                }
              } else {
                console.log(routeStops.length);
                map.graphics.remove(routeStops.shift());
                routeStops.unshift({});
                $("#startAddress_input").val("Please Try Again");
                $('#solveRoute').css("visibility", "hidden");
              }
            },
            error: function (xhr, textStatus, errorThrown) {
              console.log("test failed");
              console.log("ERROR:" + xhr.responseText + xhr.status + errorThrown);
              return false;
            }
          });


        });

      }

      function addDestinationStop(){

        $("#myLocation").on('click', inputAddress);


       
      mapOnClick_addDestinationStop_connect= map.on("click", function(evt){

          $("#BypassRoute").css('display',"none");
        $("#NormalRoute").css('display',"none");
        $('#solveRoute').css("visibility", "hidden");
        
          clearRoutes();
          var longlat = webMercatorUtils.xyToLngLat(evt.mapPoint["x"], evt.mapPoint["y"], true);
          console.log("There are " + routeStops.length + " stops");
          map.graphics.remove(routeStops.pop());
          endPoint = new Point(longlat)
          routeStops.push(map.graphics.add(new esri.Graphic(endPoint,stopSymbol)));
          $.ajax({
            type: 'POST',
            url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location="+longlat[0]+"%2C+"+longlat[1]+"&distance=200&outSR=&f=pjson",
            success: function (results, textStatus, xhr) {
              var parsedResults = JSON.parse(results);
              console.log(parsedResults);
              if(parsedResults.address){
                $("#destinationAddress_input").val(parsedResults.address.Match_addr.replace("California", "CA"));
                
                if(routeStops[0].geometry && routeStops[1].geometry){
                  $('#solveRoute').css("visibility", "visible");
                }
              } else {
                console.log(routeStops.length);
                map.graphics.remove(routeStops.pop());
                routeStops.push({});
                $("#destinationAddress_input").val("Please Try Again");
                $('#solveRoute').css("visibility", "hidden");
              }

            },
            error: function (xhr, textStatus, errorThrown) {
              console.log("test failed");
              console.log("ERROR:" + xhr.responseText + xhr.status + errorThrown);
              return false;
            }
          });


        });
      }


      function addInitialDestinationStop(){
        console.log("add initial dest called");
        mapOnClick_addStops_connect = map.on("click", function(evt){
          var longlat = webMercatorUtils.xyToLngLat(evt.mapPoint["x"], evt.mapPoint["y"], true);
          map.graphics.remove(routeStops.pop());
          routeStops.push(map.graphics.add(new esri.Graphic(new Point(longlat),stopSymbol)));
          $.ajax({
            type: 'POST',
            url: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location="+longlat[0]+"%2C+"+longlat[1]+"&distance=200&outSR=&f=pjson",
            success: function (results, textStatus, xhr) {
              var parsedResults = JSON.parse(results);
              console.log(parsedResults);
              if(parsedResults.address){
                $("#destinationAddressInitial_input").val(parsedResults.address.Match_addr.replace("California", "CA"));
                $("#destinationAddress_input").val(parsedResults.address.Match_addr.replace("California", "CA"));
                map.centerAt(evt.mapPoint);
                  $('#solveRoute').css("visibility", "visible");
                  console.log(whichStopAddressInput);
                } else {
                  console.log(routeStops.length);
                  map.graphics.remove(routeStops.pop());
                  routeStops.push({});
                  $("#destinationAddressInitial_input").val("Please Try Again");
              }
            },
            error: function (xhr, textStatus, errorThrown) {
              console.log("test failed");
              console.log("ERROR:" + xhr.responseText + xhr.status + errorThrown);
              return false;
            }
          });
                  console.log(whichStopAddressInput)
        if(whichStopAddressInput != "initial"){
          removeEventHandlers();
        }

        });


      }


      function addInitialDestinationStop(){
        console.log("add initial dest called");
        mapOnClick_addInitialStop_connect= map.on("click", function(evt){
          var longlat = webMercatorUtils.xyToLngLat(evt.mapPoint["x"], evt.mapPoint["y"], true);
          map.graphics.remove(routeStops.pop());
          routeStops.push(map.graphics.add(new esri.Graphic(new Point(longlat),stopSymbol)));
          $.ajax({
            type: 'POST',
            url: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location="+longlat[0]+"%2C+"+longlat[1]+"&distance=200&outSR=&f=pjson",
            success: function (results, textStatus, xhr) {
              var parsedResults = JSON.parse(results);
              console.log(parsedResults);
              if(parsedResults.address){
                $("#destinationAddressInitial_input").val(parsedResults.address.Match_addr.replace("California", "CA"));
                // $("#destinationAddress_input").val(parsedResults.address.Match_addr.replace("California", "CA"));
                map.centerAt(evt.mapPoint);
                  $('#solveRoute').css("visibility", "visible");
                  console.log(whichStopAddressInput);
                } else {
                  console.log(routeStops.length);
                  map.graphics.remove(routeStops.pop());
                  routeStops.push({});
                  $("#destinationAddressInitial_input").val("Please Try Again");
              }
            },
            error: function (xhr, textStatus, errorThrown) {
              console.log("test failed");
              console.log("ERROR:" + xhr.responseText + xhr.status + errorThrown);
              return false;
            }
          });
        });


      }


      //Clears all stops
      function clearStops() {
        removeEventHandlers();

        map.graphics.remove(routeStops.shift());
        routeStops.unshift({});
        map.graphics.remove(routeStops.pop());
        routeStops.push({});
      }

      function clearBarriers() {
        removeEventHandlers();
        for (var i=barriers.length-1; i>=0; i--) {
          map.graphics.remove(barriers.splice(i, 1)[0]);
        }
        for (var i=irreleventBarriers.length-1; i>=0; i--) {
          map.graphics.remove(irreleventBarriers.splice(i, 1)[0]);
        }
      }

      function clearRawData() {
        removeEventHandlers();
        for (var i=rawDataPointsGraphics.length-1; i>=0; i--) {
          map.graphics.remove(rawDataPointsGraphics.splice(i, 1)[0]);
        }
      }

      function clearCrimesData() {
        removeEventHandlers();
        for (var i=rawCrimesGraphics.length-1; i>=0; i--) {
          map.graphics.remove(rawCrimesGraphics.splice(i, 1)[0]);
        }
      }

      function clearFeaturesData() {
        removeEventHandlers();
        for (var i=rawFeaturesGraphics.length-1; i>=0; i--) {
          map.graphics.remove(rawFeaturesGraphics.splice(i, 1)[0]);
        }
      }

      function addMyLocationDot() {
        clearMyLocation();
        var long;
        var lat;
        var centerpoint;
        var xyUnits;
        var newExtent;
        var minx=map.extent.xmin;
        var miny=map.extent.ymin;
        var maxx=map.extent.xmax;
        var maxy=map.extent.ymax;
        console.log(minx,miny,maxx,maxy);
        var myAddress;

        var locationOutline = new SimpleLineSymbol();
        var locationPointMarker = new SimpleMarkerSymbol();
        locationOutline.setColor(new Color([0,191,255,1]));
        locationPointMarker.setColor(new Color([0,191,255,1]));
        locationPointMarker.setOutline(locationOutline);
        locationPointMarker.setSize(9);

        if(whichStopAddressInput == "start"){
          $('#startAddress_input').val("Please Wait...");
        } else if(whichStopAddressInput == "end"){
          $('#destinationAddress_input').val("Please Wait...");
        }


        navigator.geolocation.getCurrentPosition(function(position){

          long = position.coords.longitude;
          lat = position.coords.latitude;


          centerpoint = new Point(long,lat);

          myLocation.push(map.graphics.add(new esri.Graphic(centerpoint,locationPointMarker)));


          $.ajax({
            type: 'POST',
            url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location="+long+"%2C+"+lat+"&distance=200&outSR=&f=pjson",
            success: function (results, textStatus, xhr) {


              var parsedResults = JSON.parse(results);
              myAddress=parsedResults.address.Address;

              if(parsedResults.address && whichStopAddressInput=="initial"){
                $('#solveRoute').css("visibility","hidden");
                $("#destinationAddressInitial_input").val("");
                $("#destinationAddressInitial_input").attr("placeholder","Your Location is ... "+ myAddress);
              }


              if(whichStopAddressInput == "start"){
                if(parsedResults.address){
                  $("#startAddress_input").val(parsedResults.address.Match_addr.replace("California", "CA"));
                  if(routeStops[0].geometry && routeStops[1].geometry){
                    $('#solveRoute').css("visibility", "visible");
                  }
                } else {
                  // map.graphics.remove(routeStops.shift());
                  // routeStops.unshift({});
                  $("#startAddress_input").val("Please Try Again");
                  $('#solveRoute').css("visibility", "hidden");
                }

              } else if(whichStopAddressInput == "end"){
                if(parsedResults.address){
                  $("#destinationAddress_input").val(parsedResults.address.Match_addr.replace("California", "CA"));
                  if(routeStops[0].geometry && routeStops[1].geometry){
                    $('#solveRoute').css("visibility", "visible");

                  }
                } else {
                  map.graphics.remove(routeStops.pop());
                  routeStops.push(map.graphics.add({}));
                  $("#destinationAddress_input").val("Please Try Again");
                  $('#solveRoute').css('display',"none");
                }
              }

            },
              error: function (xhr, textStatus, errorThrown) {
                console.log("test failed");
                console.log("ERROR:" + xhr.responseText + xhr.status + errorThrown);
                return false;
              }
            });

          console.log(whichStopAddressInput);
          if(whichStopAddressInput=="start" ||  whichStopAddressInput=="end"){
            xyUnits = webMercatorUtils.lngLatToXY(long, lat);


            if(map.extent.xmin>xyUnits[0]){
              minx = xyUnits[0] - .10 * (map.extent.xmax-xyUnits[0]);

            } else if(map.extent.xmax<xyUnits[0]){
              maxx = xyUnits[0] + .10 * (xyUnits[0]-map.extent.xmin);
            }

            if(map.extent.ymin>xyUnits[1]){
              miny = xyUnits[1] - .30 * (map.extent.ymax-xyUnits[1]);

            } else if(map.extent.ymax<xyUnits[1]){
              maxy = xyUnits[1] + .10 * (xyUnits[1]-map.extent.ymin);
            }

            newExtent = new Extent({xmin:minx,ymin:miny,xmax:maxx,ymax:maxy,spatialReference:{wkid:102100}});
            //map.setExtent(newExtent);
          } else {
            map.centerAndZoom(centerpoint,13);
            // map.graphics.remove(routeStops.pop());
            // routeStops.push(map.graphics.add({}));
          }


          });

      }

      function clearMyLocation(){
        map.graphics.remove(myLocation.splice(0, 1)[0]);
      }


      function addSquareBarrier(long, lat,max,value) {
        //op as opacity, radius as radius

        var op = value/max;

        var impedance = op*10;
        var outlineop;

        xmin = long;
        ymax = lat;

        //Change square outline

        if(impedance > 1){
          outlineop = .2
        } else{
          outlineop = 0;
        }

        if(!barrierVisibility){
          op = 0;
          outlineop = 0;
        }
        //Change square color

        //just for a testing

        polygonBarrierSymbol.setColor(new Color([255,0,0,op]));

        polygonBarrierSymbol.setOutline(new SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new Color([250,0,0,outlineop]), 2));

        var topLeftPoint = new esri.geometry.Point([xmin, ymax]);

        var ring = []; // point that make up the circle


        ring.push([topLeftPoint.x,topLeftPoint.y]);
        ring.push([topLeftPoint.x + 0.001651218959260686, topLeftPoint.y]);
        ring.push([topLeftPoint.x + 0.001651218959260686, topLeftPoint.y - 0.0013911360369712373]);
        ring.push([topLeftPoint.x, topLeftPoint.y - 0.0013911360369712373]);

        ring.push(ring[0]); // start point needs to == end point
        var square = new esri.geometry.Polygon(ring);
        var polygonbarrier = new esri.Graphic(square,polygonBarrierSymbol);
        polygonbarrier.attributes= {BarrierType: 1, Attr_Miles: impedance};


        if(impedance > 1.2){//Readjust here in case there are too many barriers on the screen
          barriers.push(map.graphics.add(polygonbarrier));
        }else {
          irreleventBarriers.push(map.graphics.add(polygonbarrier));
        }
      }

     //Load-in barrier circle(polygon)



      //Stops listening for click events to add barriers and stops (if they've already been wired)
      function removeEventHandlers() {


        

              if (mapOnClick_addInitialStop_connect) {
          mapOnClick_addInitialStop_connect.remove();
        }
                if (mapOnClick_addDestinationStop_connect) {
          mapOnClick_addDestinationStop_connect.remove();
        }

        if (mapOnClick_addStartStop_connect) {
          mapOnClick_addStartStop_connect.remove();

        }
        if (mapOnClick_addBarriers_connect) {
          mapOnClick_addBarriers_connect.remove();
        }
        if (mapOnClick_addPolygonBarriers_connect) {
          mapOnClick_addPolygonBarriers_connect.remove();
        }
        if (myLocationToAddress_connect) {
          myLocationToAddress_connect.remove();
        }
        $("#myLocation").off('click', inputAddress);
      }

      function syncRouteWB(routeStops) { //With Barriers
        var minRoutePathLength;
        var stops = [[routeStops[0].geometry.x,routeStops[0].geometry.y],[routeStops[1].geometry.x,routeStops[1].geometry.y]];

        var polygonBarriersURL= "{\"features\":[";

        //temporarily change for testing 5 where barriers.length was before

        for(var i = 0; i< barriers.length; i++){

          polygonBarriersURL += "{\"geometry\":{\"rings\":[[";
          for(var j = 0; j < 5/*barriers[i].geometry.rings[0].length*/; j++){
            polygonBarriersURL += "["+barriers[i].geometry.rings[0][j][0]+","+barriers[i].geometry.rings[0][j][1]+"]";
            if(j<4){
              polygonBarriersURL += ",";
            }
          }
          polygonBarriersURL += "]]},\"attributes\":{\"BarrierType\":1,\"Attr_Miles\":"+barriers[i].attributes.Attr_Miles+"}}";
          if(i<barriers.length-1){
            polygonBarriersURL += ",";
          }
        }
        polygonBarriersURL += "]}";

        polygonBarriersURL= "polygonBarriers=" + polygonBarriersURL;

        var finalSynchronousBarriersURL = 'https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve?'+walkModeUrl+'token='+globalToken+'&stops='+stops[0][0]+','+stops[0][1]+';'+stops[1][0]+','+stops[1][1]+"&"+ polygonBarriersURL+'&f=json&returnPolygonBarriers=true';

        $.ajax({
          type: 'POST',
          url: finalSynchronousBarriersURL,


          success: function (results, textStatus, xhr) {

            $("#BypassRoute").css('display',"inline-block");
            $("#NormalRoute").css('display',"inline-block");
            $(".bottom-route-bar").css('display',"block");

          $("#resetBtn").css("visibility","visible");
          $("#featuresButton").css("visibility","visible");
          $("#crimesButton").css("visibility","visible");
          $(".call-police").css("visibility","visible");
          $("#myLocation").css("visibility","visible");


            
                        $('#directions-button').css('display',"inline");

                        sRouteWB = JSON.parse(results);

                        bypassRouteDirections = JSON.parse(results).directions;
                        bypassRoute = new esri.geometry.Polyline(sRouteWB.routes.features[0].geometry.paths[0]);
                        routes.push(map.graphics.add(new esri.Graphic(bypassRoute,routeSymbols["selectedRoute"])));


                        if(sRouteWB.routes.features[0].geometry.paths[0].length>sRoute.routes.features[0].geometry.paths[0].length){
                          minRoutePathLength = sRoute.routes.features[0].geometry.paths[0].length;
                        } else {
                          minRoutePathLength=sRouteWB.routes.features[0].geometry.paths[0].length;
                        }


                        for(var i = 0; i < minRoutePathLength; i++){
                          //only if routes are the same do you give the option for bypass and normal routes.

                            $("#BypassRoute").css('display',"inline-block");
                            $("#NormalRoute").css('display',"inline-block");

                        }

                        chosenRouteDirections = sRouteWB.directions;


            
            
                        bypassTimeDistance = "(" + sRouteWB.directions[0].summary.totalLength.toFixed(1) +" mi "+ (sRouteWB.directions[0].summary.totalLength*60/3.1).toFixed(0) + " min)";


                        //$('#solveRoute').text("Pick Safer Way" + " " + bypassTimeDistance);

                        $("#bypassOption").html((sRouteWB.directions[0].summary.totalLength*60/3.1).toFixed(0)+" min");
                        $("#calc-time-dist").html(bypassTimeDistance)

                        $(".map").LoadingOverlay("hide");
                        //enableNewRouteBtn();
                        enableButtons();
                        enableStartEndTextboxes();

          },
          error: function (xhr, textStatus, errorThrown) {
            console.log("test failed");
            console.log("ERROR:" + xhr.responseText + xhr.status + errorThrown);
            return false;
          }
        });

      }


      function syncRouteWOB(routeStops) {//Without Barriers
        //console.log("without Barriers called");
        var stops = [[routeStops[0].geometry.x,routeStops[0].geometry.y],[routeStops[1].geometry.x,routeStops[1].geometry.y]];
        var pluralityMinutes = "minutes";
        $.ajax({
          type: 'POST',
          url: 'https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve?'+walkModeUrl+'token='+globalToken+'&stops='+stops[0][0]+','+stops[0][1]+';'+stops[1][0]+','+stops[1][1]+'&f=json',

          success: function (results, textStatus, xhr) {

            if(newRouteAllowed == true){
                        sRoute = JSON.parse(results);
                        normalRouteDirections = JSON.parse(results).directions;

                        normalRoute = new esri.geometry.Polyline(sRoute.routes.features[0].geometry.paths[0]);
                        routes.push(map.graphics.add(new esri.Graphic(normalRoute,routeSymbols["unselectedRoute"])));

                        for(var i = 0 ; i < sRoute.directions[0].features.length; i++)
                        {
                          //console.log(sRoute.directions[0].features[i].attributes.text); shows written directions
                        };
                        normalTimeDistance = "(" + sRoute.directions[0].summary.totalLength.toFixed(1) +" mi "+ (sRoute.directions[0].summary.totalLength*60/3.1).toFixed(0) + " min)";
                        $("#normalOption").html((sRoute.directions[0].summary.totalLength*60/3.1).toFixed(0)+" min");

                        }
          },
          error: function (xhr, textStatus, errorThrown) {
            console.log("test failed");
            console.log("ERROR:" + xhr.responseText + xhr.status + errorThrown);
            return false;
          }
        });
      }

      function chooseBypass(){
        clearRoutes();
        $("#directions-button").css('display',"block");

        routes.push(map.graphics.add(new esri.Graphic(normalRoute,routeSymbols["unselectedRoute"])));
        routes.push(map.graphics.add(new esri.Graphic(bypassRoute,routeSymbols["selectedRoute"])));
        chosenRouteDirections = bypassRouteDirections;
        $("#calc-time-dist").html(bypassTimeDistance);
      }

      function chooseNormal(){
        clearRoutes();
        $("#directions-button").css('display',"block");

        routes.push(map.graphics.add(new esri.Graphic(bypassRoute,routeSymbols["unselectedRoute"])));
        routes.push(map.graphics.add(new esri.Graphic(normalRoute,routeSymbols["selectedRoute"])));
        chosenRouteDirections = normalRouteDirections;
        $("#calc-time-dist").html(normalTimeDistance);
      }

      //Solves the routes. Any errors will trigger the errorHandler function.
      function solveRoute() {
        removeEventHandlers();
        navigationExtents();
        newRouteAllowed = true;
        syncRouteWOB(routeStops);
        syncRouteWB(routeStops);
      }

      function solveInitialRoute() {
        removeEventHandlers();
        plotInitialStart();
        navigationExtents();
        syncRouteWOB(routeStops);
        syncRouteWB(routeStops);
      }

      function solveRouteClick() {

       console.log($("#destinationAddress_input").val($("#destinationAddressInitial_input").val()));
        $(".map").LoadingOverlay("show");
          barrierVisibility = true;
          resetBarriers();

          $("#resetBtn").css("visibility","hidden");
          $("#featuresButton").css("visibility","hidden");
          $("#crimesButton").css("visibility","hidden");
          $(".call-police").css("visibility","hidden");
          $("#myLocation").css("visibility","hidden");

          $("#crimeInfo").html("Crime Grid");
          $("#crimesButton").data("crimeDisplay","crimeGrid");
          $("#crimesButton").removeClass("fa-history");
          $("#crimesButton").removeClass("fa-male");
          $("#crimesButton").removeClass("fa-warning");
          $("#crimesButton").addClass("fa-delicious");

          $("#crimesButton").removeClass("iconUnselected");
          $("#crimesButton").addClass("iconSelected");

          if(routeStops[0].geometry){
            solveRoute();
          } else {
            solveInitialRoute();
          }
          $(".nav-bar-wrapper").css('display',"none");
          $('#solveRoute').css("visibility","hidden");
          $("#destinationAddressInitial").css('display',"none");
          $("#address-wrapper").css('display',"block");
          
        whichStopAddressInput="";
        map.on("extent-change", addDesignatedStop);
      }

      //Clears all routes
      function clearRoutes() {
        $("#directions-button").css("display","none");

        for (var i=routes.length-1; i>=0; i--) {
          map.graphics.remove(routes.splice(i, 1)[0]);
        }
      }

      //Draws the resulting routes on the map
      function showRoute(evt) {

        console.log(evt.result.routeResults);
        clearRoutes();
        array.forEach(evt.result.routeResults, function(routeResult, i) {
          routes.push(
            map.graphics.add(
              routeResult.route.setSymbol(routeSymbols[routeResult.routeName])
              )
            );
        });

        console.log(map.graphics);


        var msgs = ["Server messages:"];
        array.forEach(evt.result.messages, function(message) {
          msgs.push(message.type + " : " + message.description);
        });

        var solveResult = evt.result;
        routeResults = solveResult.routeResults;
        //console.log(routeResults[0].directions);
        console.log("The total drive time is " + routeResults[0].directions.totalDriveTime);
        console.log("The total length is " + routeResults[0].directions.totalLength);
        console.log("The total time is " + routeResults[0].directions.totalTime);
      }
      //Reports any errors that occurred during the solve
      function errorHandler(err) {
        alert("An error occured\n" + err.message + "\n" + err.details.join("\n"));
      }
      //Clear all
      function clearAll() {
        clearStops();
        clearBarriers();
      }


     function dangerAlgorithm(dataz) {

      var calculatedArray = [];

      var xmin=SantaMonicaCoordinates.xmin;
      var xmax=SantaMonicaCoordinates.xmax;
      var ymax=SantaMonicaCoordinates.ymax;
      var ymin=SantaMonicaCoordinates.ymin;

      var xcells = Math.ceil((xmax-xmin)/SantaMonicaCoordinates.blockWidthXY); //defines how many 300' sections in x direction
      var ycells = Math.ceil((ymax-ymin)/SantaMonicaCoordinates.blockWidthXY); //defines how many 300' sections in y direction

      var longLatTL = webMercatorUtils.xyToLngLat(xmin, ymax, true); //converts the top left xy coordinate into longitude and latitude
      var longLatRB = webMercatorUtils.xyToLngLat(xmax, ymin, true); //converts the right bottom xy coordinate into longitude and latitude
      //console.log(longLatTL); //shows it to make sure it reflects reality
      //console.log(longLatRB); //shows it to make sure it reflects reality

      var xdata;
      var ydata;
      var pointWeight;
      var weightCollection=[];

      var xval;
      var yval;
      var wval;


      //This reflects how far the center of each cell is from eachother, in terms of [longitude, latitude]. This is approximate since earth is round
      var deltaLngLat = [(-longLatTL[0]+longLatRB[0])/xcells,(-longLatRB[1]+longLatTL[1])/ycells];

      for(var i = 0; i < xcells; i++){
        calculatedArray[i]=[];//sets the stage for a new column
        for(var m = 0; m < ycells; m++){
          calculatedArray[i].push(0);//adds the indicated number of rows in each column
        }
      }

      for(var j = 0; j < dataz.length; j++){ //this calculates each of the xcell/ycell combos that are going to get a point added.
        xdata = Math.floor((dataz[j][2]-longLatTL[0])/deltaLngLat[0]); //represents the x coordinate of the grid.  This represents which ycell column we are looking at
        ydata = Math.floor((longLatTL[1]-dataz[j][1])/deltaLngLat[1]); //represents the y coordinate of the grid.  This represents which element in the ycell column we are referring to
        pointWeight = dataz[j][3];//This is the weight of the point we are looking at

        if(xdata<42 && xdata>=0 && ydata<36 && ydata>=0){
          weightCollection.push([xdata,ydata,pointWeight]);//sets up an array that designates which cell the severity weight (included as well) will be added to, while making sure it fits in the extents of the calculated array
        }
      }

      var maxValue = 0
      for(var m = 0; m < weightCollection.length; m++) {
       xval = weightCollection[m][0];
       yval = weightCollection[m][1];
       wval = weightCollection[m][2];
          calculatedArray[xval][yval] += wval;//If you want to just count the crimes in the area, change wval to 1;
          if(calculatedArray[xval][yval]>maxValue){
            maxValue = calculatedArray[xval][yval];
          }
        }
        return calculatedArray;
      }






      function TLandBR() {

        var normalDataPoint = new esri.symbol.PictureMarkerSymbol();
        normalDataPoint.setOffset(0, 0);
        normalDataPoint.setAngle(230);
        normalDataPoint.setHeight(10);
        normalDataPoint.setWidth(10);
        normalDataPoint.setUrl("/images/redDot.png");

        var plotPoint1 = new esri.Graphic(new esri.geometry.Point([-118.51618659213699, 34.04798141125096]),normalDataPoint);

        var plotPoint2 = new esri.Graphic(new esri.geometry.Point([-118.44683539584804, 33.997900513919994]),normalDataPoint);


        filteredPoints.push(map.graphics.add(plotPoint1));
        filteredPoints.push(map.graphics.add(plotPoint2));

      }

      function addDataPoint(longitude, latitude, weight) {

        var normalDataPoint = new esri.symbol.PictureMarkerSymbol();
        normalDataPoint.setOffset(0, 0);
        normalDataPoint.setAngle(230);
        normalDataPoint.setHeight(10);
        normalDataPoint.setWidth(10);
        normalDataPoint.setUrl("/images/blackDot.png");

        var center = new esri.geometry.Point([longitude, latitude]);

        var plotPoint = new esri.Graphic(center,normalDataPoint);


        filteredPoints.push(map.graphics.add(plotPoint));
      }

      function footTrafficCalculator (dataz) {

        var calculatedArray = [];

        var xmin=SantaMonicaCoordinates.xmin;
        var xmax=SantaMonicaCoordinates.xmax;
        var ymax=SantaMonicaCoordinates.ymax;
        var ymin=SantaMonicaCoordinates.ymin;

        var desiredBlockSize = 1200;
        var blockSizeFactor = 300/desiredBlockSize;

      var xcells = Math.ceil(blockSizeFactor*(xmax-xmin)/SantaMonicaCoordinates.blockWidthXY); //defines how many 600' sections in x direction
      var ycells = Math.ceil(blockSizeFactor*(ymax-ymin)/SantaMonicaCoordinates.blockWidthXY); //defines how many 600' sections in y direction

      var longLatTL = webMercatorUtils.xyToLngLat(xmin, ymax, true); //converts the top left xy coordinate into longitude and latitude
      var longLatRB = webMercatorUtils.xyToLngLat(xmax, ymin, true); //converts the right bottom xy coordinate into longitude and latitude


      var xdata;
      var ydata;
      var pointWeight;
      var weightCollection=[];

      var xval;
      var yval;
      var wval;


      //This reflects how far the center of each cell is from eachother, in terms of [longitude, latitude]. This is approximate since earth is round
      var deltaLngLat = [(-longLatTL[0]+longLatRB[0])/xcells,(-longLatRB[1]+longLatTL[1])/ycells];

      for(var i = 0; i < xcells; i++){
        calculatedArray[i]=[];//sets the stage for a new column
        for(var m = 0; m < ycells; m++){
          calculatedArray[i].push(0);//adds the indicated number of rows in each column
        }
      }

      for(var j = 0; j < dataz.length; j++){ //this calculates each of the xcell/ycell combos that are going to get a point added.
        xdata = Math.floor((dataz[j][2]-longLatTL[0])/deltaLngLat[0]); //represents the x coordinate of the grid.  This represents which ycell column we are looking at
        ydata = Math.floor((longLatTL[1]-dataz[j][1])/deltaLngLat[1]); //represents the y coordinate of the grid.  This represents which element in the ycell column we are referring to
        pointWeight = dataz[j][3];//This is the weight of the point we are looking at

        if(xdata<xcells && xdata>=0 && ydata<ycells && ydata>=0){
          weightCollection.push([xdata,ydata,pointWeight]);//sets up an array that designates which cell the severity weight (included as well) will be added to, while making sure it fits in the extents of the calculated array
        }
      }

      var maxValue = 0
      for(var m = 0; m < weightCollection.length; m++) {
        xval = weightCollection[m][0];
        yval = weightCollection[m][1];
        wval = weightCollection[m][2];
          calculatedArray[xval][yval] += wval;//If you want to just count the dataPoints in the area, change wval to 1;
          if(calculatedArray[xval][yval]>maxValue){
            maxValue = calculatedArray[xval][yval];
          }
        }



        return calculatedArray;
      }

      function adjustableMapIndices(array) {
        var xmin;
        var ymax;
        var max = 0;
        for(var i = 0; i < array.length; i++){
          for(var j = 0; j < array[i].length; j++){
            if(array[i][j]>max){
              max = array[i][j];

            }
          }
        }
        for(var i = 0; i < array.length; i = i+1){
          for(var j = 0; j < array[i].length; j=j+1){
            xmin = SantaMonicaCoordinates.longmin + i * 4* 0.001651218959260686;
            ymax = SantaMonicaCoordinates.latmax - j * 4* 0.0013911360369712373;
            customSquareBarrier(xmin,ymax,max,array[i][j]);
          }
        }
      }

      function customSquareBarrier (long, lat,max,value) {

        var op = value/max;
        xmin = long;
        ymax = lat;

        var polygonPopulationSymbol = new esri.symbol.SimpleFillSymbol();

        polygonPopulationSymbol.setColor(new Color([0,0,0,op]));
          //polygonPopulationSymbol.setOutline(new SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new Color([0,0,0,op]), 2));

          var TLpoint = new esri.geometry.Point([xmin, ymax]);

          var ring = []; // points that make up the square

          ring.push([TLpoint.x, TLpoint.y]);
          ring.push([TLpoint.x + 4* 0.001651218959260686, TLpoint.y]);
          ring.push([TLpoint.x + 4* 0.001651218959260686, TLpoint.y-4*0.0013911360369712373]);
          ring.push([TLpoint.x, TLpoint.y-4*0.0013911360369712373]);

          ring.push(ring[0]); // start point needs to == end point
          var square = new esri.geometry.Polygon(ring);
          var polygonbarrier = new esri.Graphic(square,polygonPopulationSymbol);
          footTrafficSquares.push(map.graphics.add(polygonbarrier));

        }

        function crimeNormalizer (crimeArray, ftArray){

          var normalizedArray = [];
          for(var i = 0; i < crimeArray.length; i++){
        normalizedArray[i]=[];//sets the stage for a new column
        for(var m = 0; m < crimeArray[i].length; m++){
          normalizedArray[i].push(0);//adds the indicated number of rows in each column
        }
      }
      for(var i = 0; i < crimeArray.length; i++){
        var k = Math.floor(i/4);
        for(var j = 0; j < crimeArray[i].length; j++){
          var l = Math.floor(j/4);
          if(crimeArray[i][j]>0 && ftArray[k][l]>0){
            normalizedArray[i][j] = crimeArray[i][j]/ftArray[k][l];
          }
        }
      }

      return normalizedArray;
    }


    function mapNormalizedIndices(array) {
      var xmin;
      var ymax;
      var max = 0;
      for(var i = 0; i < array.length; i++){
        for(var j = 0; j < array[i].length; j++){
          if(array[i][j]>max){
            max = array[i][j];
          }
        }
      }


      for(var i = 0; i < array.length; i = i+1){
        for(var j = 0; j < array[i].length; j=j+1){
          xmin = -118.51618659213699 + i * 0.001651218959260686;
          ymax = 34.047981411250944 - j * 0.0013911360369712373;
          if(array[i][j]>0) {
            console.log(i,j,array[i][j]);
          }
          addFilteredSquareGrid(xmin,ymax,max,array[i][j]);
        }
      }
    }

    function addFilteredSquareGrid (long, lat,max,value) {

      var op = value/max;
      xmin = long;
      ymax = lat;

      var polygonGridSymbol = new esri.symbol.SimpleFillSymbol();

      polygonGridSymbol.setColor(new Color([0,150,0,op]));
      polygonGridSymbol.setOutline(new SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new Color([0,150,0,op]), 2));

      var TLpoint = new esri.geometry.Point([xmin, ymax]);

          var ring = []; // points that make up the square

          ring.push([TLpoint.x, TLpoint.y]);
          ring.push([TLpoint.x + 0.001651218959260686, TLpoint.y]);
          ring.push([TLpoint.x + 0.001651218959260686, TLpoint.y-0.0013911360369712373]);
          ring.push([TLpoint.x, TLpoint.y-0.0013911360369712373]);

          ring.push(ring[0]); // start point needs to == end point
          var square = new esri.geometry.Polygon(ring);
          normalizedArrayGraphics.push(map.graphics.add(new esri.Graphic(square,polygonGridSymbol)));

        }

        function mapAllIndices(array) {
          var xmin;
          var ymax;
        var maxNormalizer;//Used to take the xth largest value, as normalizer, not largest
        var organizer = [];
        for(var i = 0; i < array.length; i++){
          for(var j = 0; j < array[i].length; j++){
            organizer.push(array[i][j]);
          }
        }
        maxNormalizer = organizer.sort(function(a,b){return a-b})[organizer.length-5];//This is to avoid one anomaly from affecting the entire set. The whole anonymous function is because sorting with decimals is difficult otherwise;
        //console.log(maxNormalizer);


        for(var i = 0; i < array.length; i = i+1){
          for(var j = 0; j < array[i].length; j=j+1){
            xmin = SantaMonicaCoordinates.longmin + i * 0.001651218959260686;
            ymax = SantaMonicaCoordinates.latmax - j * 0.0013911360369712373;
            addSquareBarrier(xmin,ymax,maxNormalizer,array[i][j]);
          }
        }
      }



      function getGPSLocations(){

        //used to get gps locations based on given addresses
        var xCoord = 0;
        var yCoord = 0;
        var finalResults;
        var finalGeocodingURL;
        var addresses = [""];//put addresses here
        var givenAddress;
        console.log(addresses.length);

        for(var i = 0; i < addresses.length; i++ ) {
          givenAddress = addresses[i];

          //console.log(givenAddress);

          finalGeocodingURL = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/geocodeAddresses?addresses={%22records%22:[{%22attributes%22:{%22OBJECTID%22:1,%22SingleLine%22:%22" + givenAddress.replace(" ","%20") + "%22}}]}&sourceCountry=USA&token=" + globalToken + "&f=pjson";

          $.ajax({
            type: 'POST',
            url: finalGeocodingURL,
            success: function (results, textStatus, xhr) {
              finalResults = JSON.parse(results);
              xCoord = finalResults.locations[0].location.x;
              yCoord = finalResults.locations[0].location.y;
              console.log(finalResults.locations[0].address,xCoord,yCoord);
            },
            error: function (xhr, textStatus, errorThrown) {

              console.log("test failed");
              console.log("ERROR:" + xhr.responseText + xhr.status + errorThrown);
              return false;
            }
          });
        }

      }


      function formatCompleteDataset(dataz) {
        //console.log(dataz);
        var formattedBusinessArray = [];
        var rowData = new Array(6);//May need to add one more column for severity

        for(var k = 6; k < dataz.length-5; k = k+6){
          rowData[0] = new Date(dataz[k]);//Data Occured
          rowData[1] = dataz[k+1];//Description
          rowData[2] = Number(dataz[k+2]);//Latitude
          rowData[3] = Number(dataz[k+3]);//Longitude
          rowData[4]= dataz[k+4];//Category
          rowData[5]= dataz[k+5];//Dataset

          formattedBusinessArray.push(rowData);
          rowData = [0,0,0,0,0,0];
        }
        return formattedBusinessArray;
      }

//////////////////////// 8/28/2016
function plotFilteredData([mapFormat, dataSet, timeFrame]) {
console.log([mapFormat, dataSet, timeFrame]);

        //console.log(allLocations[4][5]);

        //I envision the dataSet parameter being a an array like dataSet = {crime: ["w/e","w/e"],pointsOfInterest: ["w/e","w/e"],business: ["w/e","w/e"]};

        /* var line = new SimpleLineSymbol();
        line.setColor(new Color([255, 0, 0, 1]));
        var marker = new SimpleMarkerSymbol();
        marker.setOutline(line);
        marker.setSize(4);*/
        var dataColors = {
          "Beauty/Wellness":[255,0,0, 1],
          "Entertainment":[255,0,0, 1],
          "Grocery":[255,0,0, 1],
          "Medical":[255,0,0, 1],
          "Repair":[255,0,0, 1],
          "Residence":[255,0,0, 1],
          "Restaurant/Bar":[255,0,0, 1],
          "Retail":[255,0,0, 1],
          "School":[255,0,0, 1],
          "Services":[255,0,0, 1],
          "Transportation":[255,0,0, 1],
          "Abduction":[255,0,0, 1],
          "Arson":[255,0,0, 1],
          "Assault":[255,0,0, 1],
          "Burglary":[255,0,0, 1],
          "GTA":[255,0,0, 1],
          "Homicide":[255,0,0, 1],
          "Larceny":[255,0,0, 1],
          "Narcotics":[255,0,0, 1],
          "Robbery":[255,0,0, 1],
          "Sex Offense":[255,0,0, 1],
          "Street Nuissance":[255,0,0, 1],
          "Weapon":[255,0,0, 1],
          "Sex Offender":[255,0,0, 1],
          "Wifi Location":[255,0,0, 1]
        };



        var finalDataSet = [];
        var timeFiltered = [];
        var categoryChoice = [];
        for (categories in dataSet){
          for (var i = 0; i < dataSet[categories].length; i++){
            categoryChoice.push(dataSet[categories][i]);
          }
        }
        //console.log(categoryChoice);



        //Go through and cycle through the dataset to get the rows that are required
        if(mapFormat == "Crime Grid"){
          densityGridOn = true;
          barrierVisibility = true;
          resetBarriers();
          $("#crimesButton").data("crimeDisplay","crimeGrid");
          //If order to remove barriers on changing changing screen, add densityGridOn = false; resetBarriers(); to the "directions" on.click event.
        } else{


          //In case the user clicked on the CautionGrid intially, this makes sure it clears it out for the rest of the views

          var nowDate = new Date(2016, 7,23);//Change this once you get data dynamically
          console.log(nowDate);

            //Query based on the "Category" column, may need to discuss to see how databases would do this
            if(timeFrame == "Last Day"){
              for(var i=0; i< allLocations.length; i++){
                if((nowDate-allLocations[i][0])<=8.64e+7 || allLocations[i][5].slice(0,18) =="Points of Interest" || allLocations[i][5].slice(0,8) =="Business"){
                  timeFiltered.push(allLocations[i]);
                }
              }

            } else if(timeFrame == "Last Week"){
              for(var i=0; i< allLocations.length; i++){
                if((nowDate-allLocations[i][0])<=6.048e+8 || allLocations[i][5].slice(0,18) =="Points of Interest" || allLocations[i][5].slice(0,8) =="Business"){
                  timeFiltered.push(allLocations[i]);
                }
              }

            } else if(timeFrame == "Last Month"){

              for(var i=0; i< allLocations.length; i++){
                if((nowDate-allLocations[i][0])<=2.592e+9 || allLocations[i][5].slice(0,18) =="Points of Interest" || allLocations[i][5].slice(0,8) =="Business"){
                  timeFiltered.push(allLocations[i]);
                }
              }

            } else if(timeFrame == "Last Year"){
              for(var i=0; i< allLocations.length; i++){
                if((nowDate-allLocations[i][0])<=3.154e+10 || allLocations[i][5].slice(0,18) =="Points of Interest" || allLocations[i][5].slice(0,8) =="Business"){
                  timeFiltered.push(allLocations[i]);
                }
              }

            }

            for(var i = 0; i < timeFiltered.length; i++){
              for(var j = 0; j<categoryChoice.length; j++){
                if(timeFiltered[i][4]==categoryChoice[j]){

                  finalDataSet.push(timeFiltered[i]);



                }
              }
            }





              //console.log(finalDataSet);//This is the dataSet this is going to get plotted/heatmapped

              if(mapFormat == "Raw Data"){
                //need to establish what each symbol is going to look like

                clearRawData();



                for(var i = 0; i< categoryChoice.length;i++){
                  var dataOutline = new SimpleLineSymbol();
                  dataOutline.setColor(new Color(dataColors[categoryChoice[i]]));
                  var dataPointMarker = new SimpleMarkerSymbol();
                  dataPointMarker.setColor(new Color(dataColors[categoryChoice[i]]));
                  dataPointMarker.setOutline(dataOutline);
                  dataPointMarker.setSize(4);

                  for(var j = 0; j<finalDataSet.length;j++){
                    if(finalDataSet[j][4]==categoryChoice[i]){
                      rawDataPointsGraphics.push(map.graphics.add(new esri.Graphic(new Point(finalDataSet[j][3],finalDataSet[j][2]),dataPointMarker)));
                    }
                  }
                }

              } else if(mapFormat == "Heat Map"){

                clearRawData();
                densityGridOn = false;
                barrierVisibility = false;
                resetBarriers();
                $("#crimesButton").data("crimeDisplay","none");



                var heatmapRenderer = new HeatmapRenderer({
                  colors: ["rgba(0, 0, 255, 0)","rgb(0, 0, 255)","rgb(255, 0, 255)", "rgb(255, 0, 0)"],
                  blurRadius: 12,
                  maxPixelIntensity: 250,
                  minPixelIntensity: 10
                });


                console.log(heatmapRenderer);


                //Still need to figure out the best way to display a heat map... but this is going to require choosing the correct dataset. Maybe only allow one either crime or business type data to be shown at a time (larceny and homicide but not larceny and medical locations)
              }

            }

          }


function resetBarriers(evt) {
clearBarriers();
mapAllIndices(normalizedArray);
}

function filterParameterFormatter(){

var crimeCategories = ["Abduction","Arson","Assault","Burglary","GTA","Homicide","Larceny","Narcotics","Robbery","Sex Offense","Street Nuissance","Weapon"];
var businessCategories = ["Beauty/Wellness", "Entertainment", "Grocery","Medical","Repair","Residence","Restaurant/Bar","Retail", "School","Services","Transportation"];
var poiCategories = ["Sex Offender","Wifi Location"];

var outputArray = [filterParametersCollector[0], {crime: [], pointsOfInterest: [], business: []},filterParametersCollector[2]];

for(var i = 0; i < filterParametersCollector[1].length; i++){
  for(var j=0; j<crimeCategories.length; j++){
    if(filterParametersCollector[1][i]==crimeCategories[j]){
      outputArray[1].crime.push(filterParametersCollector[1][i]);
    }
  }

  for(var j=0; j<businessCategories.length; j++){
    if(filterParametersCollector[1][i]==businessCategories[j]){
      outputArray[1].business.push(filterParametersCollector[1][i]);
    }
  }

  for(var j=0; j<poiCategories.length; j++){
    if(filterParametersCollector[1][i]==poiCategories[j]){
      outputArray[1].pointsOfInterest.push(filterParametersCollector[1][i]);
    }
  }

}

return outputArray;
}

//9/14
function crimesPlot(){



    var dataOutline = new SimpleLineSymbol();
    var dataPointMarker = new SimpleMarkerSymbol();
    var nowDate = new Date(2016, 7,23);//Change this once you get data dynamically

    var dataColors = {
      "Street Nuissance":[255,255,0, 1],
      "Sex Offense":[255,255,0, 1],
      "Narcotics":[255,255,0, 1],
      "Larceny":[255,165,0, 1],
      "Robbery":[255,165,0, 1],
      "Burglary":[255,165,0, 1],
      "Weapon":[255,0,0, 1],
      "Assault":[255,0,0, 1],
      "GTA":[255,0,0, 1],
      "Homicide":[255,0,0, 1]
    };

    if(filteredCrimeLocations[0]){

      console.log("filteredCrimeLocations called in crimeplot");
      for(var i = 0; i<filteredCrimeLocations.length; i++){
          dataOutline.setColor(new Color(dataColors[filteredCrimeLocations[i][4]]));
          dataPointMarker.setColor(new Color(dataColors[filteredCrimeLocations[i][4]]));
          dataPointMarker.setOutline(dataOutline);
          dataPointMarker.setSize(4);
          rawCrimesGraphics.push(map.graphics.add(new esri.Graphic(new Point(filteredCrimeLocations[i][3],filteredCrimeLocations[i][2]),dataPointMarker)));
    }

    } else{
    for(var i = 0; i<allLocations.length; i++){
      if(dataColors[allLocations[i][4]] && (nowDate-allLocations[i][0])<=86400){
        filteredCrimeLocations.push(allLocations[i]);
        dataOutline.setColor(new Color(dataColors[allLocations[i][4]]));
        dataPointMarker.setColor(new Color(dataColors[allLocations[i][4]]));
        dataPointMarker.setOutline(dataOutline);
        dataPointMarker.setSize(4);
        rawCrimesGraphics.push(map.graphics.add(new esri.Graphic(new Point(allLocations[i][3],allLocations[i][2]),dataPointMarker)));
      }
    }
  }
}


function sexOffendersPlot(){
  console.log("sex offenders called");

    var dataOutline = new SimpleLineSymbol();
    var dataPointMarker = new SimpleMarkerSymbol();
    var nowDate = new Date(2016, 7,23);//Change this once you get data dynamically

    var dataColors = {"Sex Offender":[160,32,240, 1]};

    if(filteredSexOffendersLocations[0]){
      for(var i = 0; i<filteredSexOffendersLocations.length; i++){
        console.log("filteredCrimeLocations called in sexoffenders");
          dataOutline.setColor(new Color(dataColors[filteredSexOffendersLocations[i][4]]));
          dataPointMarker.setColor(new Color(dataColors[filteredSexOffendersLocations[i][4]]));
          dataPointMarker.setOutline(dataOutline);
          dataPointMarker.setSize(4);
          //console.log(filteredCrimeLocations[i][3],filteredCrimeLocations[i][2]);
          rawCrimesGraphics.push(map.graphics.add(new esri.Graphic(new Point(filteredSexOffendersLocations[i][3],filteredSexOffendersLocations[i][2]),dataPointMarker)));
    }

    } else{
    for(var i = 0; i<allLocations.length; i++){
      if(dataColors[allLocations[i][4]] && (nowDate-allLocations[i][0])<=86400){
        filteredSexOffendersLocations.push(allLocations[i]);
        dataOutline.setColor(new Color(dataColors[allLocations[i][4]]));
        dataPointMarker.setColor(new Color(dataColors[allLocations[i][4]]));
        dataPointMarker.setOutline(dataOutline);
        dataPointMarker.setSize(4);
        rawCrimesGraphics.push(map.graphics.add(new esri.Graphic(new Point(allLocations[i][3],allLocations[i][2]),dataPointMarker)));
      }
    }
  }
}

function openBusinessPlot(){
  var dataOutline = new SimpleLineSymbol();
  var dataPointMarker = new SimpleMarkerSymbol();
  var dataColors = {
    "Entertainment":[0,255,0, 1],
    "Restaurant/Bar":[0,255,0, 1]
  };

   if(filteredBusinessLocations[0]){
      for(var i = 0; i<filteredBusinessLocations.length; i++){
          dataOutline.setColor(new Color([0,0,0,1]));
          dataPointMarker.setColor(new Color(dataColors[filteredBusinessLocations[i][4]]));
          dataPointMarker.setOutline(dataOutline);
          dataPointMarker.setSize(4);
          rawFeaturesGraphics.push(map.graphics.add(new esri.Graphic(new Point(filteredBusinessLocations[i][3],filteredBusinessLocations[i][2]),dataPointMarker)));
    }
  } else{
    for(var i = 0; i<allLocations.length; i++){
      if(dataColors[allLocations[i][4]]){
        filteredBusinessLocations.push(allLocations[i]);
        dataOutline.setColor(new Color([0,0,0,1]));
        dataPointMarker.setColor(new Color(dataColors[allLocations[i][4]]));
        dataPointMarker.setOutline(dataOutline);
        dataPointMarker.setSize(4);
        rawFeaturesGraphics.push(map.graphics.add(new esri.Graphic(new Point(allLocations[i][3],allLocations[i][2]),dataPointMarker)));
      }
    }
  }






}

function wifiLocationsPlot(){
  var dataOutline = new SimpleLineSymbol();
  var dataPointMarker = new SimpleMarkerSymbol();
  var dataColors = {
    "Wifi Location":[0,0,255, 1]
  };



if(filteredWifiLocations[0]){
      for(var i = 0; i<filteredWifiLocations.length; i++){
          dataOutline.setColor(new Color(dataColors[filteredWifiLocations[i][4]]));
          dataPointMarker.setColor(new Color(dataColors[filteredWifiLocations[i][4]]));
          dataPointMarker.setOutline(dataOutline);
          dataPointMarker.setSize(4);
          rawFeaturesGraphics.push(map.graphics.add(new esri.Graphic(new Point(filteredWifiLocations[i][3],filteredWifiLocations[i][2]),dataPointMarker)));
    }
  } else{
    for(var i = 0; i<allLocations.length; i++){
      if(dataColors[allLocations[i][4]]){
        filteredWifiLocations.push(allLocations[i]);
        dataOutline.setColor(new Color(dataColors[allLocations[i][4]]));
        dataPointMarker.setColor(new Color(dataColors[allLocations[i][4]]));
        dataPointMarker.setOutline(dataOutline);
        dataPointMarker.setSize(4);
        rawFeaturesGraphics.push(map.graphics.add(new esri.Graphic(new Point(allLocations[i][3],allLocations[i][2]),dataPointMarker)));
      }
    }
  }


}

function currentStartPosition() {


  navigator.geolocation.getCurrentPosition(function(position){

    long = position.coords.longitude;
    lat = position.coords.latitude;
    var startAddress;


    $.ajax({
      type: 'POST',
      url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location="+long+"%2C+"+lat+"&distance=200&outSR=&f=pjson",
      success: function (results, textStatus, xhr) {

        startAddress = JSON.parse(results).address.Match_addr;
      },
      error: function (xhr, textStatus, errorThrown) {
        console.log("test failed");
        console.log("ERROR:" + xhr.responseText + xhr.status + errorThrown);
        return false;
      }
    });


  });
}

function navigationExtents() {
  var newExtent;
  var minx=map.extent.xmin;
  var miny=map.extent.ymin;
  var maxx=map.extent.xmax;
  var maxy=map.extent.ymax;
  var startStopXY = [webMercatorUtils.lngLatToXY(routeStops[0].geometry.x, routeStops[0].geometry.y),webMercatorUtils.lngLatToXY(routeStops[1].geometry.x, routeStops[1].geometry.y)];
  var startCoord = {x: startStopXY[0][0], y: startStopXY[0][1]};
  var endCoord = {x: startStopXY[1][0], y: startStopXY[1][1]};
  maxx = Math.max(startCoord.x,endCoord.x) + .25* Math.abs(endCoord.x-startCoord.x);
  minx = Math.min(startCoord.x,endCoord.x) - .25* Math.abs(endCoord.x-startCoord.x);

  newExtent = new Extent({xmin:minx,ymin:miny,xmax:maxx,ymax:maxy,spatialReference:{wkid:102100}});
  map.setExtent(newExtent);
  var originalYDiff = .5*((maxy-miny)-(Math.max(startCoord.y,endCoord.y)-Math.min(startCoord.y,endCoord.y)));

  if((maxy-miny)>(Math.max(startCoord.y,endCoord.y)-Math.min(startCoord.y,endCoord.y))){
    maxy = Math.max(startCoord.y,endCoord.y) + originalYDiff;
    miny = Math.min(startCoord.y,endCoord.y) - originalYDiff;
  } else {
    maxy = Math.max(startCoord.y,endCoord.y) + .6* Math.abs(endCoord.y-startCoord.y);
    miny = Math.min(startCoord.y,endCoord.y) - .4* Math.abs(endCoord.y-startCoord.y);
  }

  newExtent = new Extent({xmin:minx,ymin:miny,xmax:maxx,ymax:maxy,spatialReference:{wkid:102100}});
  map.setExtent(newExtent);

}

function resetBarriersPoints(){
  resetBarriers();
  resetPoints();
  $("#startAddress").blur();
  $("#destinationAddress").blur();
}

function resetPoints(){
  if($("#crimesButton").data("crimeDisplay")=="crimePoints"){
    clearCrimesData();
    crimesPlot();
  }

}




});
