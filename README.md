# Leaflet-hash

Leaflet-hash lets you to add dynamic URL hashes to web pages with Leaflet maps. You can easily
link users to specific map views.

![Leaflet-hash](https://github.com/mlevans/leaflet-hash/raw/master/screenshots/screenshot.png)

### Demo
You can view a demo of leaflet-hash at [mlevans.github.io/leaflet-hash/map.html](http://mlevans.github.io/leaflet-hash/map.html).

### Getting started

1. Prepare a basic leaflet map. You can find instructions on [Leaflet's quick-start guide](http://leaflet.cloudmade.com/examples/quick-start.html).

2. Include [leaflet-hash.js](https://github.com/mlevans/leaflet-hash/blob/master/leaflet-hash.js).

3. Once you have initialized the map (an instance of [L.Map](http://leaflet.cloudmade.com/reference.html#map-usage)), add the following code:

	```javascript
        // Assuming your map instance is in a variable called map
        var hash = new L.Hash(map);
    ```

### Author
[@mlevans](http://github.com/mlevans)

### Contributors
[@calvinmetcalf](http://github.com/calvinmetcalf)

[@jfirebaugh](http://github.com/jfirebaugh)

[@rsudekum](http://github.com/rsudekum)

[@tmcw](http://github.com/tmcw)

[@yohanboniface](http://github.com/yohanboniface)


### License

MIT License. See [LICENSE](https://github.com/mlevans/leaflet-hash/blob/master/LICENSE.md) for details.
