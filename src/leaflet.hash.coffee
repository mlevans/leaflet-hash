class Hash
	constructor: (@map,@options={}) ->
		unless @options.path
			if @options.lc
				@options.path = '{z}/{lat}/{lng}/{base}'#/{overlay}'
			else
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
			@map.on "moveend baselayerchange", ()=>
				pstate = @formatHash()
				if location.hash != pstate[2]
					history.pushState pstate...
		else
			location.hash = @formatHash()[2] unless location.hash
			onHashChange = ()=>
				pstate = @formatHash()
				if location.hash != pstate[2]
					location.hash = pstate[2]
			@map.on "moveend baselayerchange", onHashChange
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
		if @options.lc
			baseIndex = path.indexOf("{base}")
			#overlayIndex = path.indexOf("{overlay}")
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
			if args.length > 3
				out.base = args[baseIndex]
				#out.overlay = args[overlayIndex]
			out
		else
			false
	updateFromState : (state)=>
		@map.setView state.center, state.zoom
		if state.base
			@setBase state.base
		#if state.overlay
		#	@setOverlay state.overlay.join(",")
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
			#state.overlay=layers[1]
			#template.overlay = layers[1].join(",") if layers[1]
			#template.overlay = "-" unless layers[1]
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
		baseLayers = @options.lc._baseLayersList
		len = baseLayers.children.length
		i=0
		while i < len
			if baseLayers.children[i].innerText.slice(1) == baseLayer
				baseLayers.children[i].children[0].checked=true
			i++
		@options.lc._onInputClick()
	setOverlay : (overlayString)=>
		if overlayString == "-"
			return
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
		@options.lc._onInputClick()

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
