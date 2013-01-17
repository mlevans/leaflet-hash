class Hash
	constructor: (@map,@options={}) ->
		unless @options.path
			if @options.lc
				@options.path = '{z}/{lat}/{lng}/{base}'
			else
				@options.path = '{z}/{lat}/{lng}'
		if @map._loaded
			@startListning()
		else	
			@map.on "load", @startListning
	startListning : =>
		@updateFromState @parseHash(location.hash) if location.hash
		if history.pushState
			history.replaceState(@formatState()...) unless location.hash
			window.onpopstate=(event)=>
				@updateFromState(event.state) if event.state
			@map.on "moveend", ()=>
				pstate = @formatState()
				if location.hash != pstate[2] and !@moving
					history.pushState pstate...
		else
			location.hash = @formatState()[2] unless location.hash
			onHashChange = ()=>
				pstate = @formatState()
				if location.hash != pstate[2] and !@moving
					location.hash = pstate[2]
			@map.on "moveend", onHashChange
			if ('onhashchange' of window) and (window.documentMode == undefined or window.documentMode > 7)
				window.onhashchange = ()=>
					@updateFromState @parseHash(location.hash) if location.hash
			else
				@hashChangeInterval = setInterval onHashChange, 50
		@map.on "baselayerchange", (e)=>
			@base = @options.lc._layers[e.layer._leaflet_id].name
			pstate = @formatState()
			if history.pushState
				if location.hash != pstate[2] and !@moving
					history.pushState pstate...
			else
				if location.hash != pstate[2] and !@moving
					location.hash = pstate[2]
				
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
				if args.length > 3
					out.base = args[path.indexOf("{base}")]
					out
				else
					out
		else
			false
	updateFromState : (state)=>
		return if @moving
		console.log "moving"
		@moving = true
		@map.setView state.center, state.zoom
		@setBase state.base if state.base
		@moving = false
		console.log "not moving"
		true
	formatState : () =>
		center = @map.getCenter()
		zoom = @map.getZoom()
		precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2))
		state =  {center:center,zoom:zoom}
		template = {lat:center.lat.toFixed(precision),lng:center.lng.toFixed(precision),z:zoom}
		if @options.path.indexOf("{base}") > -1
			state.base = @getBase()
			template.base = state.base
		[
			state
			"a"
			'#'+L.Util.template @options.path,template
		]
	setBase : (base)=>
		@base = base
		inputs = @options.lc._form.getElementsByTagName('input')
		len = inputs.length
		i = 0
		while i<len
			if inputs[i].name is 'leaflet-base-layers' and @options.lc._layers[inputs[i].layerId].name is base
				inputs[i].checked = true
				@options.lc._onInputClick()
				return true
			i++
	getBase : =>
		if @base
			return @base
		inputs = @options.lc._form.getElementsByTagName('input')
		len = inputs.length
		i = 0
		while i<len
			if inputs[i].name is 'leaflet-base-layers' and inputs[i].checked
				@base = @options.lc._layers[inputs[i].layerId].name
				return @base
		false	
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