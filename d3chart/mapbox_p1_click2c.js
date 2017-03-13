mapboxgl.accessToken = 'pk.eyJ1Ijoic3dlZXR5bWVvdyIsImEiOiJjaXoxdHM4aWowNHI2MnFxZjZtbmw4cDJ4In0.1140mL1gVeMEdPvgmOOG0g';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [-122.468245, 37.772703],
    //            center: [-103.59179687498357, 40.66995747013945],
    zoom: 2
});

map.on('load', function () {

    // Add a new source from our GeoJSON data and set the
    // 'cluster' option to true.
    map.addSource("return_network_data", {
        type: "geojson",
        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        data: "data/ReturnNetworkData_F2_6.geojson",
        //     data: "https://www.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson",
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    // Use the earthquakes source to create five layers:
    // One for unclustered points, three for each cluster category,
    // and one for cluster labels.
    map.addLayer({
        "id": "unclustered-points",
        "type": "symbol",
        "source": "return_network_data",
        "filter": ["!has", "point_count"],
        "layout": {
            "icon-image": "college-15",
            "icon-size": 1.5
        }
    });

    // Display the earthquake data in three layers, each filtered to a range of
    // count values. Each range gets a different fill color.
    var layers = [
                [10, '#f28cb1'], [5, '#f1f075'], [0, '#51bbd6']
            ];

    layers.forEach(function (layer, i) {
        map.addLayer({
            "id": "cluster-" + i,
            "type": "circle",
            "source": "return_network_data",
            "paint": {
                "circle-color": layer[1],
                "circle-color": layer[1],
                "circle-radius": 18
            },
            "filter": i === 0 ? [">=", "point_count", layer[0]] : ["all",
                    [">=", "point_count", layer[0]],
                    ["<", "point_count", layers[i - 1][0]]]
        });
    });

    // Add a layer for the clusters' count labels
    map.addLayer({
        "id": "cluster-count",
        "type": "symbol",
        "source": "return_network_data",
        "layout": {
            "text-field": "{point_count}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12
        }
    });

    map.on('click', function (e) {
        var features = map.queryRenderedFeatures(e.point, {
            layers: ["cluster-2"]
        });
        var pointFeatures = map.queryRenderedFeatures(e.point, {
            layers: ["unclustered-points"]
        });

        console.log(features.length ? features[0].properties :
            (pointFeatures.length ? pointFeatures[0].properties : "NO Features"));

        if (!pointFeatures.length) {
            return;
        } else {
            var feature = pointFeatures[0];
            console.log(feature.geometry.coordinates);
            // Populate the popup and set its coordinates
            // based on the feature found.
            var popup = new mapboxgl.Popup()
                .setLngLat(feature.geometry.coordinates)
                .setHTML('<p><b>' + feature.properties["Loc_Country"] + ': ' +
                    ' </b><br>' + feature.properties["description"] + '</p>')
                .addTo(map);
        }


    });
});
