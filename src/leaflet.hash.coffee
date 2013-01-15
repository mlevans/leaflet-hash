class Hash
	constructor: (@map,@options={}) ->
		unless @options.path
			if @options.lc
				@options.path = '{z}/{lat}/{lng}/{base}/{overlay}'
			else
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
		if @options.lc
			baseIndex = path.indexOf("{base}")
			overlayIndex = path.indexOf("{overlay}")
		hash = hash.substr(1)  if hash.indexOf("#") is 0
		args = hash.split("/")
		if args.length > 2
			zoom = parseInt(args[zIndex], 10)
			lat = parseFloat(args[latIndex])
			lon = parseFloat(args[lngIndex])
			if isNaN(zoom) or isNaN(lat) or isNaN(lon)
				false
			else
				center: new L.LatLng(lat, lon)
				zoom: zoom
			if args > 4
				@setBase args[baseIndex]
				@setOverlay args[overlayIndex]
		else
			false
    
	formatHash : () =>
		center = @map.getCenter()
		zoom = @map.getZoom()
		precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2))
		state =  {center:center,zoom:zoom}
		template = {lat:center.lat.toFixed(precision),lng:center.lng.toFixed(precision),z:zoom}
		if @options.lc
			layers = @getLayers()
			state.base=layers[0]
			template.base=layers[0]
			state.overlay=layers[1]
			template.overlay = layers[1].join(",")
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
	getLayers : ()=>
		out=["",[]]
		for key of @options.lc._layers
			if @map._layers[key]
				if @options.lc._layers[key].overlay
					out[1].push @options.lc._layers[key].name
				else
					out[0] = @options.lc._layers[key].name
		out
	setBase : (baseLayer)=>
		baseLayers = @options.lc._container.children[1].children[0].children
		len = baseLayers.length
		i=0
		while i < len
			if baseLayers[i].children[1].innerHTML.slice(1) == baseLayer
				baseLayers[i].children[0].setAttribute "checked","checked"
			i++
		@options.lc.onInputClick()
	setOverlay : (overlayString)=>
		overlays = overlayString.split(",")
		overlayLayers = @options.lc._container.children[1].children[2].children
		len = overlayLayers.length
		i=0
		while i < len
			if overlayLayers[i].children[1].innerHTML.slice(1) in overlays
				overlayLayers[i].children[0].checked = true
			else
				overlayLayers[i].children[0].checked = false
			i++
		@options.lc.onInputClick()
		
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
	removeHash:()->
		@_hash.remove()
		@

