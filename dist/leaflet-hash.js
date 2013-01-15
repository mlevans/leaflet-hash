(function() {
  var Hash,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Hash = (function() {

    function Hash(map) {
      this.map = map;
      this.remove = __bind(this.remove, this);

      this.formatHash = __bind(this.formatHash, this);

      if (history.pushState) {
        this.withPushState();
      } else {
        this.withoutPushState();
      }
    }

    Hash.prototype.withPushState = function() {
      var parsed,
        _this = this;
      window.onpopstate = function(event) {
        if (event.state) {
          return _this.map.setView(event.state.center, event.state.zoom);
        }
      };
      if (location.hash) {
        parsed = this.parseHash(location.hash);
        this.map.setView(parsed.center, parsed.zoom);
      } else {
        history.replaceState.apply(history, this.formatHash());
      }
      return this.map.on("moveend", function() {
        var pstate;
        pstate = _this.formatHash();
        if (location.hash !== pstate[2]) {
          return history.pushState.apply(history, pstate);
        }
      });
    };

    Hash.prototype.withoutPushState = function() {
      var onHashChange, parsed,
        _this = this;
      if (location.hash) {
        parsed = this.parseHash(location.hash);
        this.map.setView(parsed.center, parsed.zoom);
      } else {
        location.hash = this.formatHash()[2];
      }
      this.map.on("moveend", function() {
        var pstate;
        pstate = _this.formatHash();
        if (location.hash !== pstate[2]) {
          return location.hash = pstate[2];
        }
      });
      if (('onhashchange' in window) && (window.documentMode === void 0 || window.documentMode > 7)) {
        return window.onhashchange = function() {
          if (location.hash) {
            parsed = _this.parseHash(location.hash);
            return _this.map.setView(parsed.center, parsed.zoom);
          }
        };
      } else {
        onHashChange = function() {
          var pstate;
          pstate = _this.formatHash();
          if (location.hash !== pstate[2]) {
            return location.hash = pstate[2];
          }
        };
        return this.hashChangeInterval = setInterval(onHashChange, 50);
      }
    };

    Hash.prototype.parseHash = function(hash) {
      var args, lat, lon, zoom;
      if (hash.indexOf('#') === 0) {
        hash = hash.substr(1);
      }
      args = hash.split("/");
      if (args.length === 3) {
        zoom = parseInt(args[0], 10);
        lat = parseFloat(args[1]);
        lon = parseFloat(args[2]);
        if (isNaN(zoom) || isNaN(lat) || isNaN(lon)) {
          return false;
        } else {
          return {
            center: new L.LatLng(lat, lon),
            zoom: zoom
          };
        }
      } else {
        return false;
      }
    };

    Hash.prototype.formatHash = function() {
      var center, precision, zoom;
      center = this.map.getCenter();
      zoom = this.map.getZoom();
      precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));
      return [
        {
          center: center,
          zoom: zoom
        }, "a", '#' + [zoom, center.lat.toFixed(precision), center.lng.toFixed(precision)].join("/")
      ];
    };

    Hash.prototype.remove = function() {
      this.map.off("moveend");
      if (window.onpopstate) {
        window.onpopstate = null;
      }
      return location.hash = "";
    };

    return Hash;

  })();

  L.Map.prototype.addHash = function() {
    this._hash = new Hash(this);
    return this;
  };

  L.Map.prototype.removeHash = function() {
    this._hash.remove();
    return this;
  };

}).call(this);
