class Hash
	constructor: (@map,@options={}) ->
		unless @options.path
			@options.path = '{z}/{lat}/{lng}'
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
		path = @options.path.split("/")
		zIndex = path.indexOf("{z}")
		latIndex = path.indexOf("{lat}")
		lngIndex = path.indexOf("{lng}")
		hash = hash.substr(1)  if hash.indexOf("#") is 0
		args = hash.split("/")
		if args.length is path.length
			zoom = parseInt(args[zIndex], 10)
			lat = parseFloat(args[latIndex])
			lon = parseFloat(args[lngIndex])
			if isNaN(zoom) or isNaN(lat) or isNaN(lon)
				false
			else
				center: new L.LatLng(lat, lon)
				zoom: zoom
		else
			false
    
	formatHash : () =>
		center = @map.getCenter()
		zoom = @map.getZoom()
		precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2))
		[
			{center:center,zoom:zoom}
			"a"
			'#'+L.Util.template @options.path,
				lat:center.lat.toFixed(precision)
				lng:center.lng.toFixed(precision)
				z:zoom
		]
	
	remove : ()=>
		@map.off "moveend"
		if window.onpopstate
			window.onpopstate = null
		location.hash=""
L.Hash = Hash

L.hash = (map,options={})->
	return new L.Hash(map,options)

L.Map.include
	addHash:(options={})->
		if @_loaded
			@_hash =  new Hash(@,options)
		else
			@on "load",()=>
				@_hash =  new Hash(@,options)
		@
	removeHash=()->
		@_hash.remove()
		@

