enyo.kind({
    name: "Main.Morf",
	kind: "VFlexBox",
	components: [
		{kind: "Header", content: "Morf.js Demo"},
		
		{kind: "VFlexBox", style: "height:70px;", components: [
			{kind: "HFlexBox", style: "height:52px; margin-top:10px; margin-bottom:10px;", components: [
				{flex: 1},
				{style: "background-color:#eeeeee; width: 552px;", components: [
					{name: "myElem", content: "<div id='elem' style='width:50px; height:50px; background:#4B8A79; border:1px solid #000'></div>"}
				]},
				{flex: 1}
			]}
		]},
		
		{kind: "FadeScroller", flex: 1, components: [
			{kind: "Divider", caption: "Native"},
			{kind: "HFlexBox", components: [
				{kind: "Button", flex: 1, caption: "linear", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "ease", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "ease-in", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "ease-out", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "ease-in-out", onclick: "animate"},
			]},
			{style: "height: 40px;"},
			{kind: "Divider", caption: "Custom"},
			{kind: "HFlexBox", components: [
				{kind: "Button", flex: 1, caption: "sinusoidal", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "spring", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeTo", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeFrom", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeFromTo", onclick: "animate"}
			]},
			{kind: "HFlexBox", components: [
				{kind: "Button", flex: 1, caption: "bouncePast", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "bounce", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "swingTo", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "swingFrom", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "swingFromTo", onclick: "animate"}
			]},
			{kind: "HFlexBox", components: [
				{kind: "Button", flex: 1, caption: "elastic", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeInOutBack", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeOutBack", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeInBack", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeOutBounce", onclick: "animate"}
			]},
			{kind: "HFlexBox", components: [
				{kind: "Button", flex: 1, caption: "easeInOutCirc", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeOutCirc", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeInCirc", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeInOutExpo", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeOutExpo", onclick: "animate"}
			]},
			{kind: "HFlexBox", components: [
				{kind: "Button", flex: 1, caption: "easeInExpo", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeInOutSine", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeOutSine", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeInSine", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeInOutQuint", onclick: "animate"}
			]},
			{kind: "HFlexBox", components: [
				{kind: "Button", flex: 1, caption: "easeOutQuint", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeInQuint", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeInOutQuart", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeOutQuart", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeInQuart", onclick: "animate"}
			]},
			{kind: "HFlexBox", components: [
				{kind: "Button", flex: 1, caption: "easeInOutCubic", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeOutCubic", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeInCubic", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeInOutQuad", onclick: "animate"},
				{kind: "Button", flex: 1, caption: "easeOutQuad", onclick: "animate"}
			]}
		]}
	],
	renderd: function() {
		this.animated = false;
	},
	animate: function(inSender, inEvent) {
		//console.log(inSender.onclick);
		
		var easing = inSender.caption;
		
		// Get a reference to the element
		var elem = document.getElementById('elem');
		
		var duration = "1500ms";
		
		if (this.animated) {
			var pos = "0px";
			var rotation = "0deg";
			var color = "#4B8A79";
			this.animated = false;
		} else {
			var pos = "500px";
			var rotation = "90deg";
			var color = "#D4421F";
			this.animated = true;
		}
		
		var transform = 'translate3d('+ pos +', 0, 0) rotate('+ rotation +')';
		
		var trans = Morf.transition( elem, {
	        // New CSS state
	        '-webkit-transform': transform,
	        'background-color': color
	    }, {
	        duration: duration,
	        timingFunction: easing
	    });
	    
	    //console.log("finish");
	}
});