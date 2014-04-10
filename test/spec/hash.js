describe("L.Hash", function() {

    var map;

    mocha.ignoreLeaks();

    beforeEach(function() {
        map = new L.Map(document.createElement('div'));
    });

    it('sets a hash when the map is moved', function() {
        var hash = L.hash(map);
        map.setView([51.505, -0.09], 13);
        expect(location.hash).to.be('#13/51.5050/-0.0900');
    });

    it('uses a hash set initially on the page', function(done) {
        location.hash = '#13/10/40';
        var hash = L.hash(map);
        window.setTimeout(function() {
            expect(Math.round(map.getCenter().lat)).to.be(10);
            expect(Math.round(map.getCenter().lng)).to.be(40);
            done();
        }, 200);
    });

    it('responds to a hash change after an initial hash is set', function(done) {
        map.setView([51.505, -0.09], 13);
        location.hash = '#13/20/40';
        var hash = L.hash(map);
        window.setTimeout(function() {
            expect(Math.round(map.getCenter().lat)).to.be(20);
            expect(Math.round(map.getCenter().lng)).to.be(40);
            done();
        }, 200);
    });

    it('does not acknowledge a junk hash', function(done) {
        var hash = L.hash(map);
        map.setView([51, 2], 13);
        location.hash = '#foo';
        window.setTimeout(function() {
            expect(Math.round(map.getCenter().lat)).to.eql(51);
            expect(Math.round(map.getCenter().lng)).to.eql(2);
            done();
        }, 200);
    });

    it('unbinds events when removed', function() {
        location.hash = '';
        var hash = L.hash(map);
        map.removeControl(hash);
        map.setView([51.505, -0.09], 13);
        expect(location.hash).to.be('');
    });

    it('parses a hash', function() {
      var parsed = L.Hash.parseHash('#13/20/40');
      expect(parsed.zoom).to.be(13);
      expect(parsed.center).to.be.a(L.LatLng);
      expect(parsed.center).to.eql({lat: 20, lng: 40});
    });

    it('formats a hash', function() {
      map.setView([51, 2], 13);
      expect(L.Hash.formatHash(map)).to.be('#13/51.0000/2.0000');
    });
    
    function setQueryVariable(hash, key, value) {
      var vars = hash.split("&");
      var found = false;
      for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == key){
          vars[i] = key + "=" + value;
          found = true;
        }
      }
      if (! found) { vars.push(  key + "=" + value ); }
      return(vars.join("&"));
    }

    function getQueryVariable(hash, variable) {
      var vars = hash.split("&");
      for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
      }
      return(false);
    }

    it('updates hash from layers', function() {
      var hash = L.hash(map);
      map.setView([51.505, -0.09], 13);
       
      var group = L.layerGroup();
      group.addTo(map);

      hash.on('change', function(hash) {
        var ids = [];
        group.eachLayer( function(layer) { ids.push(layer.getAttribution()); } );
        return setQueryVariable(hash, "layers", ids.join(','));
      });

      var layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: 'OSM' });
      group.addLayer( layer );
      hash.trigger('move');

      expect(location.hash).to.be('#13/51.5050/-0.0900&layers=OSM');

      var hot_layer = L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { attribution: 'HOT' });
      group.addLayer( hot_layer );
      hash.trigger('move');
      expect(location.hash).to.be('#13/51.5050/-0.0900&layers=OSM,HOT');  
   
      group.removeLayer(layer);
      group.removeLayer(hot_layer);
      hash.trigger('move');  
      expect(location.hash).to.be('#13/51.5050/-0.0900&layers=');     
    });

    it('updates layers from hash', function(done) {
      var hash = L.hash(map);
      map.setView([51.505, -0.09], 13);

      var group = L.layerGroup();
      group.addTo(map);

      hash.on('update', function(hash) {
        group.eachLayer( function(layer) { group.removeLayer( layer ); });
        layers = getQueryVariable(hash, "layers");
        if (layers == "OSM") {
          var layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: 'OSM' });
          group.addLayer( layer );
        } else if (layers = "HOT") {
          var layer = L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { attribution: 'HOT' });
          group.addLayer( layer );
        }
      });

      location.hash = '#13/20/40&layers=HOT';
      window.setTimeout(function() {
        expect(Math.round(map.getCenter().lat)).to.be(20);
        expect(Math.round(map.getCenter().lng)).to.be(40);
        var ids = [];
        group.eachLayer( function(layer) { ids.push(layer.getAttribution()); } );
          expect(ids[0]).to.be("HOT");
          expect(ids.length).to.be(1);
          done();
        }, 200);  
    });
});
