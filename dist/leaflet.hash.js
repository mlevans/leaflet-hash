(function() {
  var Hash,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  Hash = (function() {

    function Hash(map, options) {
      this.map = map;
      this.options = options != null ? options : {};
      this.remove = __bind(this.remove, this);

      this.formatHash = __bind(this.formatHash, this);

      this.updateFromState = __bind(this.updateFromState, this);

      this.startListning = __bind(this.startListning, this);

      if (!this.options.path) {
        this.options.path = '{z}/{lat}/{lng}';
      }
      if (this.map._loaded) {
        this.startListning();
      } else {
        this.map.on("load", this.startListning);
      }
    }

    Hash.prototype.startListning = function() {
      var onHashChange,
        _this = this;
      if (location.hash) {
        this.updateFromState(this.parseHash(location.hash));
      }
      if (history.pushState) {
        if (!location.hash) {
          history.replaceState.apply(history, this.formatHash());
        }
        window.onpopstate = function(event) {
          if (event.state) {
            return _this.updateFromState(event.state);
          }
        };
        return this.map.on("moveend", function() {
          var pstate;
          pstate = _this.formatHash();
          if (location.hash !== pstate[2]) {
            return history.pushState.apply(history, pstate);
          }
        });
      } else {
        if (!location.hash) {
          location.hash = this.formatHash()[2];
        }
        onHashChange = function() {
          var pstate;
          pstate = _this.formatHash();
          if (location.hash !== pstate[2]) {
            return location.hash = pstate[2];
          }
        };
        this.map.on("moveend", onHashChange);
        if (('onhashchange' in window) && (window.documentMode === void 0 || window.documentMode > 7)) {
          return window.onhashchange = function() {
            if (location.hash) {
              return _this.updateFromState(_this.parseHash(location.hash));
            }
          };
        } else {
          return this.hashChangeInterval = setInterval(onHashChange, 50);
        }
      }
    };

    Hash.prototype.parseHash = function(hash) {
      var args, lat, latIndex, lngIndex, lon, out, path, zIndex, zoom;
      path = this.options.path.split("/");
      zIndex = path.indexOf("{z}");
      latIndex = path.indexOf("{lat}");
      lngIndex = path.indexOf("{lng}");
      if (hash.indexOf("#") === 0) {
        hash = hash.substr(1);
      }
      args = hash.split("/");
      if (args.length > 2) {
        zoom = parseInt(args[zIndex], 10);
        lat = parseFloat(args[latIndex]);
        lon = parseFloat(args[lngIndex]);
        if (isNaN(zoom) || isNaN(lat) || isNaN(lon)) {
          return false;
        } else {
          return out = {
            center: new L.LatLng(lat, lon),
            zoom: zoom
          };
        }
      } else {
        return false;
      }
    };

    Hash.prototype.updateFromState = function(state) {
      return this.map.setView(state.center, state.zoom);
    };

    Hash.prototype.formatHash = function() {
      var center, precision, state, template, zoom;
      center = this.map.getCenter();
      zoom = this.map.getZoom();
      precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));
      state = {
        center: center,
        zoom: zoom
      };
      template = {
        lat: center.lat.toFixed(precision),
        lng: center.lng.toFixed(precision),
        z: zoom
      };
      return [state, "a", '#' + L.Util.template(this.options.path, template)];
    };

    Hash.prototype.remove = function() {
      this.map.off("moveend");
      if (window.onpopstate) {
        window.onpopstate = null;
      }
      location.hash = "";
      return clearInterval(this.hashChangeInterval);
    };

    return Hash;

  })();

  L.Hash = Hash;

  L.hash = function() {
    var params;
    params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(L.Hash, params, function(){});
  };

  L.Map.include({
    addHash: function() {
      var params,
        _this = this;
      params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (this._loaded) {
        this._hash = (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(Hash, [this].concat(__slice.call(params)), function(){});
      } else {
        this.on("load", function() {
          return _this._hash = (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(Hash, [_this].concat(__slice.call(params)), function(){});
        });
      }
      return this;
    },
    removeHash: function() {
      this._hash.remove();
      return this;
    }
  });

}).call(this);
