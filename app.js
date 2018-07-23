(function () {

    var map, data, markers = [];

    var airtable_url = 'https://api.airtable.com/v0/appM01mYlIJUkU1Od/',
        airtable_key = 'keyl5v0iA9uirvIAH';

    var opt = {
        map: {
            url: 'https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
            options: {
                'attribution': 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> | contributors <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> | Tiles © <a href="http://cartodb.com/attributions">CartoDB</a>',
                'minZoom': 10,
                'maxZoom': 18
            }
        },
        location: {
            center: [52.5036411,13.4265875],
            zoom: 15
        },
        icon: {
            shadowUrl: 'img/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }
    };

    var icons = {
        'Refill': new L.Icon({
            iconUrl: 'img/refill.png',
            iconSize: [25, 48],
            iconAnchor: [13, 46],    // 0,0 is the top left corner
            popupAnchor: [0, -50],   // as seen from iconAnchor
        }),
        'Testimonial': new L.Icon({
            iconUrl: 'img/testimonial.png',
            iconSize: [25, 60],
            iconAnchor: [12, 58],    // 0,0 is the top left corner
            popupAnchor: [0, -60],   // as seen from iconAnchor
        }),
        'Test': new L.Icon({
            iconUrl: 'img/test.png',
            iconSize: [34, 40],
            iconAnchor: [27, 38],    // 0,0 is the top left corner
            popupAnchor: [-12, -40], // as seen from iconAnchor
        })
    };

    function init() {
        var templates = {
            'Refill': Handlebars.compile(document.getElementById('refill-template').innerHTML),
            'Testimonial': Handlebars.compile(document.getElementById('testimonial-template').innerHTML),
            'Test': Handlebars.compile(document.getElementById('test-template').innerHTML)
        }

        map = L.map('map', {
            zoomControl: true
        });

        L.tileLayer(opt.map.url, opt.map.options).addTo(map);
        map.setView(opt.location.center, opt.location.zoom);

        fetchBorders().then(function(response) {
            L.geoJSON(response, {
                style: {
                    'color': "#009fe3",
                    'weight': 12,
                    'opacity': .75,
                    'fill': null
                }
            }).addTo(map);
        });

        ['Refill', 'Testimonial', 'Test'].forEach(function(category) {

            fetchPoints(category).then(function(response) {
                L.geoJSON(toGeojson(response), {
                    pointToLayer: function(feature, latlng) {
                        var percentages = collectPercentages(feature.properties);
                        var properties = Object.assign(feature.properties, percentages);

                        var popup = templates[category](properties);

                        marker = L.marker(latlng, {icon: icons[category]});
                        marker.bindPopup(popup);
                        return marker
                    }
                }).addTo(map);
            });

        });
    }

    function fetchBorders() {
        return fetch('border.json').then(function(response) {
            return response.json();
        });
    }

    function fetchPoints(category) {
        return fetch(airtable_url + category, {
            headers: {
                'Authorization': 'Bearer ' + airtable_key
            }
        }).then(function(response) {
            return response.json();
        });
    }

    function calculatePercentage(properties, key, limit){
        var max = properties[key + " Maximum"];
        var value = properties[key];
        if (limit){
          value = properties[key + " Grenzwert"];
        }

        var o = {};
        var prefix = limit ? "_Grenzwert" : "";
        o[key + prefix + "_Percentage"] = Math.min(value / max * 100, 98);
        return o;
    }

    function collectPercentages(properties){
        var keys = [
            "Coliforme Bakterien",
            "Escheria Coli",
            "Blei",
            "Kupfer",
            "Nickel",
            "Natrium"
        ];

        return keys.reduce(function(agg, key) {
            return Object.assign(agg,
              calculatePercentage(properties, key, true),
              calculatePercentage(properties, key, false),
              );
        }, {});
    }

    function toGeojson(response) {
        var geojson = {
            type: 'FeatureCollection',
            features: []
        };

        response.records.forEach(function(record) {
            var lon = record.fields['Länge'],
                lat = record.fields['Breite'];

            if (typeof(lon) !== 'undefined' || typeof(lat) !== 'undefined') {
                var feature = {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [lon, lat]
                    },
                    properties: {
                        type: 'refill',
                    }
                }

                Object.keys(record.fields).forEach(function(key) {
                    feature.properties[key] = record.fields[key];
                });

                geojson.features.push(feature)
            }
        });

        return geojson;
    }

    document.addEventListener("DOMContentLoaded", function(event) {
        init();
    });

})();
