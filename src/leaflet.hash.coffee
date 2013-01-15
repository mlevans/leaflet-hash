class Hash
	constructor: (@map) ->
		if history.pushState
			@withPushState()
		else
			@withoutPushState()
	withPushState : ->
		window.onpopstate=(event)=>
			if event.state
				@map.setView event.state.center, event.state.zoom
		if location.hash
			parsed = @parseHash location.hash
			@map.setView parsed.center, parsed.zoom
		else
			history.replaceState @formatHash()...
		@map.on "moveend", ()=>
			pstate = @formatHash()
			if location.hash != pstate[2]
				history.pushState pstate...
	withoutPushState : ->
		if location.hash
			parsed = @parseHash location.hash
			@map.setView parsed.center, parsed.zoom
		else
			location.hash = @formatHash()[2]
		@map.on "moveend", ()=>
			pstate = @formatHash()
			if location.hash != pstate[2]
				location.hash = pstate[2]
		if ('onhashchange' of window) and (window.documentMode == undefined or window.documentMode > 7)
			window.onhashchange = ()=>
				if location.hash
					parsed = @parseHash location.hash
					@map.setView parsed.center, parsed.zoom
		else
			onHashChange = ()=>
				pstate = @formatHash()
				if location.hash != pstate[2]
					location.hash = pstate[2]
			@hashChangeInterval = setInterval onHashChange, 50

	parseHash : (hash) ->
		if hash.indexOf('#') == 0
			hash = hash.substr(1);
		args = hash.split("/");
		if (args.length == 3) 
			zoom = parseInt(args[0], 10)
			lat = parseFloat(args[1])
			lon = parseFloat(args[2])
			if  isNaN(zoom) or isNaN(lat) or isNaN(lon)
				return false;
			else
				return {
					center: new L.LatLng(lat, lon)
					zoom: zoom
				}
		else
			return false;
    
	formatHash : () =>
		center = @map.getCenter()
		zoom = @map.getZoom()
		precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2))
		[{center:center,zoom:zoom},"a",'#' + [zoom,center.lat.toFixed(precision),center.lng.toFixed(precision)].join("/")]
	
	remove : ()=>
		@map.off "moveend"
		if window.onpopstate
			window.onpopstate = null
		location.hash=""
L.Hash = Hash

L.hash = (map)->
	return new L.Hash

L.Map.include
	addHash:()->
		@_hash =  new Hash(@)
		@
	removeHash=()->
		@_hash.remove()
		@