class Hash
	constructor: (@map,@options={}) ->
		unless @options.path
			@options.path = '{z}/{lat}/{lng}'
		if @map._loaded
			@startListning()
		else	
			@map.on "load", @startListning
	startListning : =>
		@updateFromState @parseHash(location.hash) if location.hash
		if history.pushState
			history.replaceState(@formatHash()...) unless location.hash
			window.onpopstate=(event)=>
				@updateFromState(event.state) if event.state
			@map.on "moveend", ()=>
				pstate = @formatHash()
				if location.hash != pstate[2]
					history.pushState pstate...
		else
			location.hash = @formatHash()[2] unless location.hash
			onHashChange = ()=>
				pstate = @formatHash()
				if location.hash != pstate[2]
					location.hash = pstate[2]
			@map.on "moveend", onHashChange
			if ('onhashchange' of window) and (window.documentMode == undefined or window.documentMode > 7)
				window.onhashchange = ()=>
					@updateFromState @parseHash(location.hash) if location.hash
			else
				@hashChangeInterval = setInterval onHashChange, 50
	parseHash : (hash) ->
		path = @options.path.split("/")
		zIndex = path.indexOf("{z}")
		latIndex = path.indexOf("{lat}")
		lngIndex = path.indexOf("{lng}")
		hash = hash.substr(1)  if hash.indexOf("#") is 0
		args = hash.split("/")
		if args.length > 2
			zoom = parseInt(args[zIndex], 10)
			lat = parseFloat(args[latIndex])
			lon = parseFloat(args[lngIndex])
			if isNaN(zoom) or isNaN(lat) or isNaN(lon)
				return false
			else
				out ={
					center: new L.LatLng(lat, lon)
					zoom: zoom
				}
		else
			false
	updateFromState : (state)=>
		@map.setView state.center, state.zoom
	formatHash : () =>
		center = @map.getCenter()
		zoom = @map.getZoom()
		precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2))
		state =  {center:center,zoom:zoom}
		template = {lat:center.lat.toFixed(precision),lng:center.lng.toFixed(precision),z:zoom}
		[
			state
			"a"
			'#'+L.Util.template @options.path,template
		]
	remove : ()=>
		@map.off "moveend"
		if window.onpopstate
			window.onpopstate = null
		location.hash=""
		clearInterval @hashChangeInterval

L.Hash = Hash

L.hash = (params...)->
	return new L.Hash(params...)

L.Map.include
	addHash:(params...)->
		if @_loaded
			@_hash =  new Hash(@,params...)
		else
			@on "load",()=>
				@_hash =  new Hash(@,params...)
		@
	removeHash:()->
		@_hash.remove()
		@