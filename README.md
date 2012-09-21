### Leaflet-hash

Leaflet-hash lets you to add dynamic URL hashes to web pages with Leaflet maps. You can easily
link users to specific map views.

[Screenshot top level]

[Screenshot]

### How to use

You can view a demo of leaflet-hash here: mlevans.github.com/leaflet-hash/map.html.

1. Prepare a basic leaflet map. You can find instructions here: http://leaflet.cloudmade.com/examples/quick-start.html

2. Include leaflet-hash.js

3. Once you have initialized the map (an instance of L.Map), add the following code:

	var hash = new L.Hash(map); // Assumes that your map instance is in a variable called map

### License

MIT License. See License.md for details