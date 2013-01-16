(function() {
  var Hash,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  Hash = (function() {

    function Hash(map, options) {
      this.map = map;
      this.options = options != null ? options : {};
      this.setOverlay = __bind(this.setOverlay, this);

      this.setBase = __bind(this.setBase, this);

      this.getLayers = __bind(this.getLayers, this);

      this.remove = __bind(this.remove, this);

      this.formatHash = __bind(this.formatHash, this);

      this.updateFromState = __bind(this.updateFromState, this);

      this.startListning = __bind(this.startListning, this);

      if (!this.options.path) {
        if (this.options.lc) {
          this.options.path = '{z}/{lat}/{lng}/{base}';
        } else {
          this.options.path = '{z}/{lat}/{lng}';
        }
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
        return this.map.on("moveend baselayerchange", function() {
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
        this.map.on("moveend baselayerchange", onHashChange);
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
      var args, baseIndex, lat, latIndex, lngIndex, lon, out, path, zIndex, zoom;
      path = this.options.path.split("/");
      zIndex = path.indexOf("{z}");
      latIndex = path.indexOf("{lat}");
      lngIndex = path.indexOf("{lng}");
      if (this.options.lc) {
        baseIndex = path.indexOf("{base}");
      }
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
          out = {
            center: new L.LatLng(lat, lon),
            zoom: zoom
          };
        }
        if (args.length > 3) {
          out.base = args[baseIndex];
        }
        return out;
      } else {
        return false;
      }
    };

    Hash.prototype.updateFromState = function(state) {
      this.map.setView(state.center, state.zoom);
      if (state.base) {
        return this.setBase(state.base);
      }
    };

    Hash.prototype.formatHash = function() {
      var center, layers, precision, state, template, zoom;
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
      if (this.options.lc) {
        layers = this.getLayers();
        state.base = layers[0];
        template.base = layers[0];
      }
      return [state, "a", '#' + L.Util.template(this.options.path, template)];
    };

    Hash.prototype.remove = function() {
      this.map.off("moveend");
      if (window.onpopstate) {
        window.onpopstate = null;
      }
      return location.hash = "";
    };

    Hash.prototype.getLayers = function() {
      var key, out;
      out = ["", []];
      for (key in this.options.lc._layers) {
        if (this.map._layers[key]) {
          if (this.options.lc._layers[key].overlay) {
            out[1].push(this.options.lc._layers[key].name);
          } else {
            out[0] = this.options.lc._layers[key].name;
          }
        }
      }
      return out;
    };

    Hash.prototype.setBase = function(baseLayer) {
      var baseLayers, i, len;
      baseLayers = this.options.lc._baseLayersList;
      len = baseLayers.children.length;
      i = 0;
      while (i < len) {
        if (baseLayers.children[i].children[1].innerHTML.slice(1) === baseLayer) {
          baseLayers.children[i].children[0].checked = true;
        }
        i++;
      }
      return this.options.lc._onInputClick();
    };

    Hash.prototype.setOverlay = function(overlayString) {
      var i, len, overlayLayers, overlays, _ref;
      if (overlayString === "-") {
        return;
      }
      overlays = overlayString.split(",");
      overlayLayers = this.options.lc._container.children[1].children[2].children;
      len = overlayLayers.length;
      i = 0;
      while (i < len) {
        if (_ref = overlayLayers[i].children[1].innerHTML.slice(1), __indexOf.call(overlays, _ref) >= 0) {
          overlayLayers[i].children[0].checked = true;
        } else {
          overlayLayers[i].children[0].checked = false;
        }
        i++;
      }
      return this.options.lc._onInputClick();
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
