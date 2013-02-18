describe("L.Hash", function() {

    var map;

    mocha.globals(['_leaflet_hashchange15', '_leaflet_resize14',
        '_leaflet_hashchange16', '_leaflet_hashchange17', '_leaflet_hashchange18']);

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

});
