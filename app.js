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
    'Refill': new L.Icon($.extend({iconUrl: 'img/marker-icon-blue.png'}, opt.icon)),
    'Testimonial': new L.Icon($.extend({iconUrl: 'img/marker-icon-green.png'}, opt.icon)),
    'Test': new L.Icon($.extend({iconUrl: 'img/marker-icon-violet.png'}, opt.icon))
};

$(document).ready(function() {
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

    $.ajax({
        type: 'GET',
        url: 'border.json',
        success: function(geojson) {
            L.geoJSON(geojson, {
                style: {
                    'color': "#aa0000",
                    'weight': 10,
                    'opacity': .5,
                    'fill': null
                }
            }).addTo(map);
        }
    });

    $.each(['Refill', 'Testimonial', 'Test'], function(index, value) {
        $.ajax({
            type: 'GET',
            url: airtable_url + value,
            headers: {
                'Authorization': 'Bearer ' + airtable_key
            },
            success: function(response) {
                L.geoJSON(to_geojson(response), {
                    pointToLayer: function(feature, latlng) {
                        var popup = templates[value](feature.properties);

                        var options = {};

                        marker = L.marker(latlng, {icon: icons[value]});
                        marker.bindPopup(popup);
                        return marker
                    }
                }).addTo(map);
            }
        });
    });
});

function to_geojson(response) {
    var geojson = {
        type: 'FeatureCollection',
        features: []
    };

    $.each(response.records, function(index, record) {
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

            $.each(record.fields, function(key, value) {
                feature.properties[key] = value;
            });

            geojson.features.push(feature)
        }
    });

    return geojson;
}
