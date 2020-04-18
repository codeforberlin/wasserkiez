# Wasserkiez
Simple map to visualize water quality measurements taken by the German NGO [a tip:tap](https://atiptap.org/).

## About
The German NGO a tip:tap aims to encourage people to drink more tap and less bottled water. To
educate citizen about the quality of tap water they run campaigns in selected cities or city
districts. In those campaigns, water quality measurements are made in people's homes. This 
data is visualized on this website to put the measurements into perspective. The map also shows
Refill Stations where people can refill their bottles for free and testimonials.

## Technical background
All data is stored in [Airtable](https://airtable.com) databases that are managed by a tip:tap.
The app itself is a small vanilla JavaScript application that fetches the data from Airtable and loads
geojson shapes of the districts which are stored in this repository.

Contributions are welcome.
