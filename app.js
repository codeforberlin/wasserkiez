var map, data, markers = [];
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
        center: [52.5036411,13.4265875], // Germany
        zoom: 15
    }
};

$(document).ready(function() {
    map = L.map('map', {
        zoomControl: true
    });

    L.tileLayer(opt.map.url, opt.map.options).addTo(map);
    map.setView(opt.location.center, opt.location.zoom);

    var templates = {
        'refill': Handlebars.compile(document.getElementById('refill-template').innerHTML),
        'testimonial': Handlebars.compile(document.getElementById('testimonial-template').innerHTML),
        'test': Handlebars.compile(document.getElementById('test-template').innerHTML)
    };

    $.ajax({
        type: 'GET',
        url: 'https://api.airtable.com/v0/appM01mYlIJUkU1Od/Refill',
        headers: {
            'Authorization': 'Bearer keyl5v0iA9uirvIAH'
        },
        success: function(response) {
            var geojson = {
                type: 'FeatureCollection',
                features: []
            };

            $.each(response.records, function(index, record) {
                var feature = {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [
                            record.fields['Längengrad'],
                            record.fields['Breitengrad']
                        ]
                    },
                    properties: {
                        type: 'refill',
                        name: record.fields['name']
                    }
                }

                geojson.features.push(feature)
            });

            L.geoJSON(geojson, {
                style: function(feature) {
                    if (feature.properties.type == 'border') {
                        return {
                            'color': "#aa0000",
                            'weight': 10,
                            'opacity': .5,
                            'fill': null
                        };
                    } else {
                        return {};
                    }
                },
                pointToLayer: function (feature, latlng) {
                    var popup = templates[feature.properties.type](feature.properties);

                    var options = {};

                    marker = L.marker(latlng, options);
                    marker.bindPopup(popup);
                    return marker
                }
            }).addTo(map);
        }
    });
});
