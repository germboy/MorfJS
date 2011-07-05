/**
 * @preserve Morf v0.1
 * http://www.joelambert.co.uk/tween
 *
 * Copyright 2011, Joe Lambert.
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

var Morf = function(elem, css, opts) {
	var from = {}, to = {},
		
	fromElem = document.createElement('div'),
	toElem 	 = document.createElement('div'),
		
	options = {
		timingFunction: 'ease',
		duration: null,
		increment: 0.01,
		debug: false
	},
		
	// Define all other var's used in the function
	i = rule = ruleName = camel = m1 = m2 = progress = frame = rule = transEvent = null,
	
	// Setup a scoped reference to ourselves
	_this = this,
	
	keyframes = {},
	
	// Create a unique name for this animation
	animName = 'anim'+(new Date().getTime());
	

	/* --- Helper Functions ------------------------------------------------------------------- */
	
	// Event listener for the webkitAnimationEnd Event
	animationEndListener = function(event){
		// Dispatch a faux webkitTransitionEnd event to complete the appearance of this being a transition rather than an animation
		elem.removeEventListener('webkitAnimationEnd', animationEndListener, true);
		transEvent = document.createEvent("Event");
		transEvent.initEvent("webkitTransitionEnd", true, true);
		elem.dispatchEvent(transEvent);
	},
	
	// Adds the CSS to the current page
	addKeyframeRule = function(rule) {
		if (document.styleSheets && document.styleSheets.length)
			document.styleSheets[0].insertRule(rule, 0);
		else
		{
			var style = document.createElement('style');
			style.innerHTML = rule;
			document.head.appendChild(style);			
		}
	},
	
	// Produces a CSS string representation of the Keyframes
	createAnimationCSS = function(kf, name) {
		var str = '@-webkit-keyframes '+name+' {\n', f = pos = rule = null, fStr = '';
		
		for(pos in kf)
		{
			f = kf[pos];
			fStr = '\t'+pos+' {\n';
			
			for(rule in f)
				fStr += '\t\t'+_this.util.toDash(rule)+': '+f[rule]+';\n';
			
			fStr += "\t}\n\n";
			
			str += fStr;
		}
		
		return str + " }";
	};
	
	/* --- Helper Functions End --------------------------------------------------------------- */	
	
	
	// Import the options	
	for(i in opts)
		options[i] = opts[i];
		
		
	// If timingFunction is a natively supported function then just trigger normal transition
	if(	options.timingFunction === 'ease' || 
		options.timingFunction === 'linear' || 
		options.timingFunction === 'ease-in' || 
		options.timingFunction === 'ease-out' ||
		options.timingFunction === 'ease-in-out' ||
		/^cubic-bezier/.test(options.timingFunction)) {
		
		elem.style.webkitTransitionDuration = options.duration;
		elem.style.webkitTransitionTimingFunction = options.timingFunction;
		
		for(rule in css) {
			camel = this.util.toCamel(rule);	
			elem.style[camel] = css[rule];
		}
		
		this.css = '';
		
		return;	
	}
	else
	{
		// Reset transition properties for this element
		elem.style.webkitTransitionTimingFunction = null;
		elem.style.webkitTransitionDuration = 0;
	}
	
	// Setup the start and end CSS state
	for(rule in css)
	{
		camel = this.util.toCamel(rule);	
		
		toElem.style[camel] = css[rule];

		// Set the from/start state	
		from[this.util.toDash(camel)] = (camel == 'WebkitTransform') ? new WebKitCSSMatrix(elem.style.WebkitTransform) 	: elem.style[camel];
	
		// Set the to/end state
		to[this.util.toDash(camel)]	  = (camel == 'WebkitTransform') ? new WebKitCSSMatrix(toElem.style.WebkitTransform) : toElem.style[camel];
	}

	
	// Produce decompositions of matrices here so we don't have to redo it on each iteration
	// Decomposing the matrix is expensive so we need to minimise these requests
	if(from['-webkit-transform'])
	{
		m1 = from['-webkit-transform'].decompose();
		m2 = to['-webkit-transform'].decompose();
	}
	
	// Produce style keyframes
	for(progress = 0; progress <= 1; progress += options.increment) {
		// Use Shifty.js to work out the interpolated CSS state
		frame = Tweenable.util.interpolate(from, to, progress, options.timingFunction);
		
		// Work out the interpolated matrix transformation
		if(m1 !== null && m2 !== null)
			frame['-webkit-transform'] = m1.tween(m2, progress, Tweenable.prototype.formula[options.timingFunction]);
		
		keyframes[parseInt(progress*100)+'%'] = frame;
	}
	
	// Ensure the last frame has been added
	keyframes['100%'] = to;
	
	// Add the new animation to the document
	this.css = createAnimationCSS(keyframes, animName);
	addKeyframeRule(this.css);
	
	// Set the final position state as this should be a transition not an animation & the element should end in the 'to' state
	for(rule in to) 
		elem.style[this.util.toCamel(rule)] = to[rule];
	
	// Trigger the animation
	elem.addEventListener('webkitAnimationEnd', animationEndListener);
	elem.style.webkitAnimationDuration = options.duration;
	elem.style.webkitAnimationTimingFunction = 'linear';
	elem.style.webkitAnimationName = animName;
	
	// Print the animation to the console if the debug switch is given
	if(options.debug && window.console && window.console.log)
		console.log(createAnimationCSS(keyframes, animName));
};


/**
 * Convenience function for triggering a transition
 * @param {HTMLDom} elem The element to apply the transition to
 * @param {Object} css Key value pair of CSS properties
 * @param {Object} opts Additional configuration options
 * 
 * Configuration options
 * -	timingFunction: {String} Name of the easing function to perform
 * -	duration: {integer} Duration in ms
 * -	increment: {float} How frequently to generate keyframes (Defaults to 0.01, which is every 1%)
 * -	debug: {Boolean} Should the generated CSS Animation be printed to the console  
 *  
 * @returns {Morf} An instance of the Morf object
 */

Morf.transition = function(elem, css, opts){
	return new Morf(elem, css, opts);
}

/**
 * Current version
 */
Morf.version = '0.1';;

// Utilities Placeholder
Morf.prototype.util = {};


/**
 * Converts a DOM style string to CSS property name
 * @param {String} str A DOM style string
 * @returns {String} CSS property name
 */

Morf.prototype.util.toDash = function(str){
	str = str.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
	return /^webkit/.test(str) ? '-'+str : str;
};


/**
 * Converts a CSS property name to DOM style string
 * @param {String} str A CSS property name
 * @returns {String} DOM style string
 */

Morf.prototype.util.toCamel = function(str){
	return str.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
};;

// Wrap this functionality up to prevent poluting the global namespace
(function(){


/**
 * A 4 dimensional vector
 * @author Joe Lambert
 * @constructor
 */

var Vector4 = function(x, y, z, w)
{
	this.x = x ? x : 0;
	this.y = y ? y : 0;
	this.z = z ? z : 0;
	this.w = w ? w : 0;
	
	
	/**
	 * Ensure that values are not undefined
	 * @author Joe Lambert
	 * @returns null
	 */
	
	this.checkValues = function() {
		this.x = this.x ? this.x : 0;
		this.y = this.y ? this.y : 0;
		this.z = this.z ? this.z : 0;
		this.w = this.w ? this.w : 0;
	};
	
	
	/**
	 * Get the length of the vector
	 * @author Joe Lambert
	 * @returns {float}
	 */
	
	this.length = function() {
		this.checkValues();
		return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
	};
	
	
	/**
	 * Get a normalised representation of the vector
	 * @author Joe Lambert
	 * @returns {Vector4}
	 */
	
	this.normalise = function() {
		var len = this.length(),
			v = new Vector4(this.x / len, this.y / len, this.z / len);
		
		return v;
	};


	/**
	 * Vector Dot-Product
	 * @param {Vector4} v The second vector to apply the product to
	 * @author Joe Lambert
	 * @returns {float} The Dot-Product of this and v.
	 */

	this.dot = function(v) {
		return this.x*v.x + this.y*v.y + this.z*v.z + this.w*v.w;
	};
	
	
	/**
	 * Vector Cross-Product
	 * @param {Vector4} v The second vector to apply the product to
	 * @author Joe Lambert
	 * @returns {Vector4} The Cross-Product of this and v.
	 */
	
	this.cross = function(v) {
		return new Vector4(this.y*v.z - this.z*v.y, this.z*v.x - this.x*v.z, this.x*v.y - this.y*v.x);
	};
	

	/**
	 * Helper function required for matrix decomposition
	 * A Javascript implementation of pseudo code available from http://www.w3.org/TR/css3-2d-transforms/#matrix-decomposition
	 * @param {Vector4} aPoint A 3D point
	 * @param {float} ascl 
	 * @param {float} bscl
	 * @author Joe Lambert
	 * @returns {Vector4}
	 */
	
	this.combine = function(aPoint, ascl, bscl) {
		return new Vector4( (ascl * this.x) + (bscl * aPoint.x), 
							(ascl * this.y) + (bscl * aPoint.y), 
							(ascl * this.z) + (bscl * aPoint.z) );
	}
};


/**
 * Object containing the decomposed components of a matrix
 * @author Joe Lambert
 * @constructor
 */

var CSSMatrixDecomposed = function(obj) {
	obj === undefined ? obj = {} : null;
	var components = {perspective: null, translate: null, skew: null, scale: null, rotate: null};
	
	for(var i in components)
		this[i] = obj[i] ? obj[i] : new Vector4();
	
	/**
	 * Tween between two decomposed matrices
	 * @param {CSSMatrixDecomposed} dm The destination decomposed matrix
	 * @param {float} progress A float value between 0-1, representing the percentage of completion
	 * @param {function} fn An easing function following the prototype function(pos){}
	 * @author Joe Lambert
	 * @returns {WebKitCSSMatrix} A new matrix for the tweened state
	 */
		
	this.tween = function(dm, progress, fn) {
		if(fn === undefined)
			fn = function(pos) {return pos;}; // Default to a linear easing
			
		var r = new CSSMatrixDecomposed(),
			i = index = null,
			trans = '';
		
		progress = fn(progress);

		for(index in components)
			for(i in {x:'x', y:'y', z:'z', w:'w'})
				r[index][i] = parseFloat((this[index][i] + (dm[index][i] - this[index][i]) * progress ).toFixed(10));

		trans = 'matrix3d(1,0,0,0, 0,1,0,0, 0,0,1,0, '+r.perspective.x+', '+r.perspective.y+', '+r.perspective.z+', '+r.perspective.w+') ' +
				'translate3d('+r.translate.x+'px, '+r.translate.y+'px, '+r.translate.y+'px) ' +
				'rotateX('+r.rotate.x+'rad) rotateY('+r.rotate.y+'rad) rotateZ('+r.rotate.z+'rad) ' +
				'matrix3d(1,0,0,0, 0,1,0,0, 0,'+r.skew.z+',1,0, 0,0,0,1) ' +
				'matrix3d(1,0,0,0, 0,1,0,0, '+r.skew.y+',0,1,0, 0,0,0,1) ' +
				'matrix3d(1,0,0,0, '+r.skew.x+',1,0,0, 0,0,1,0, 0,0,0,1) ' +
				'scale3d('+r.scale.x+', '+r.scale.y+', '+r.scale.z+')';
		
		try { r = new WebKitCSSMatrix(trans); return r; }
		catch(e) { console.error('Invalid matrix string: '+trans); return '' };
	};
};


/**
 * Tween between two matrices
 * @param {WebKitCSSMatrix} matrix The destination matrix
 * @param {float} progress A float value between 0-1, representing the percentage of completion
 * @param {function} fn An easing function following the prototype function(pos){}
 * @author Joe Lambert
 * @returns {WebKitCSSMatrix} A new matrix for the tweened state
 */

WebKitCSSMatrix.prototype.tween = function(matrix, progress, fn) {
	if(fn === undefined)
		fn = function(pos) {return pos;}; // Default to a linear easing
	
	var m = new WebKitCSSMatrix,
		m1 = this.decompose(),
		m2 = matrix.decompose(),
		r = m.decompose()
		trans = '',
		index = i = null;
	
	// Tween between the two decompositions
	return m1.tween(m2, progress, fn);
};


/**
 * Transform a Vector4 object using the current matrix
 * @param {Vector4} v The vector to transform
 * @author Joe Lambert
 * @returns {Vector4} The transformed vector
 */

WebKitCSSMatrix.prototype.transformVector = function(v) {
	// TODO: Do we need to mod this for Vector4?
	return new Vector4(	this.m11*v.x + this.m12*v.y + this.m13*v.z, 
						this.m21*v.x + this.m22*v.y + this.m23*v.z, 
						this.m31*v.x + this.m32*v.y + this.m33*v.z );
};


/**
 * Transposes the matrix
 * @author Joe Lambert
 * @returns {WebKitCSSMatrix} The transposed matrix
 */

WebKitCSSMatrix.prototype.transpose = function() {
	var matrix = new WebKitCSSMatrix(), n = m = 0;
	
	for (n = 0; n <= 4-2; n++)
	{
		for (m = n + 1; m <= 4-1; m++)
		{
			matrix['m'+(n+1)+(m+1)] = this['m'+(m+1)+(n+1)];
			matrix['m'+(m+1)+(n+1)] = this['m'+(n+1)+(m+1)];
		}
	}
	
	return matrix;
};


/**
 * Calculates the determinant
 * @author Joe Lambert
 * @returns {float} The determinant of the matrix
 */

WebKitCSSMatrix.prototype.determinant = function() {
	return 	this.m14 * this.m23 * this.m32 * this.m41-this.m13 * this.m24 * this.m32 * this.m41 -
			this.m14 * this.m22 * this.m33 * this.m41+this.m12 * this.m24 * this.m33 * this.m41 +
			this.m13 * this.m22 * this.m34 * this.m41-this.m12 * this.m23 * this.m34 * this.m41 -
			this.m14 * this.m23 * this.m31 * this.m42+this.m13 * this.m24 * this.m31 * this.m42 +
			this.m14 * this.m21 * this.m33 * this.m42-this.m11 * this.m24 * this.m33 * this.m42 -
			this.m13 * this.m21 * this.m34 * this.m42+this.m11 * this.m23 * this.m34 * this.m42 +
			this.m14 * this.m22 * this.m31 * this.m43-this.m12 * this.m24 * this.m31 * this.m43 -
			this.m14 * this.m21 * this.m32 * this.m43+this.m11 * this.m24 * this.m32 * this.m43 +
			this.m12 * this.m21 * this.m34 * this.m43-this.m11 * this.m22 * this.m34 * this.m43 -
			this.m13 * this.m22 * this.m31 * this.m44+this.m12 * this.m23 * this.m31 * this.m44 +
			this.m13 * this.m21 * this.m32 * this.m44-this.m11 * this.m23 * this.m32 * this.m44 -
			this.m12 * this.m21 * this.m33 * this.m44+this.m11 * this.m22 * this.m33 * this.m44;
};


/**
 * Decomposes the matrix into its component parts.
 * A Javascript implementation of the pseudo code available from http://www.w3.org/TR/css3-2d-transforms/#matrix-decomposition
 * @author Joe Lambert
 * @returns {Object} An object with each of the components of the matrix (perspective, translate, skew, scale, rotate)
 */

WebKitCSSMatrix.prototype.decompose = function() {
	var matrix = new WebKitCSSMatrix(this.toString()),
		perspectiveMatrix = rightHandSide = inversePerspectiveMatrix = transposedInversePerspectiveMatrix =
		perspective = translate = row = i = scale = skew = pdum3 =  rotate = null;
	
	// Normalize the matrix.
	if (matrix.m33 == 0)
	    return false;


	for (i = 1; i <= 4; i++)
	    for (j = 1; j <= 4; j++)
	        matrix['m'+i+j] /= matrix.m44;

	// perspectiveMatrix is used to solve for perspective, but it also provides
	// an easy way to test for singularity of the upper 3x3 component.
	perspectiveMatrix = matrix;

	for (i = 1; i <= 3; i++)
	    perspectiveMatrix['m'+i+'4'] = 0;

	perspectiveMatrix.m44 = 1;

	if (perspectiveMatrix.determinant() == 0)
	    return false;

	// First, isolate perspective.
	if (matrix.m14 != 0 || matrix.m24 != 0 || matrix.m34 != 0)
	{
	    // rightHandSide is the right hand side of the equation.
		rightHandSide = new Vector4(matrix.m14, matrix.m24, matrix.m34, matrix.m44);
		
	    // Solve the equation by inverting perspectiveMatrix and multiplying
	    // rightHandSide by the inverse.
	    inversePerspectiveMatrix 			= perspectiveMatrix.inverse();
	    transposedInversePerspectiveMatrix 	= inversePerspectiveMatrix.transpose();
	    perspective 						= transposedInversePerspectiveMatrix.transformVector(rightHandSide);

	     // Clear the perspective partition
	    matrix.m14 = matrix.m24 = matrix.m34 = 0;
	    matrix.m44 = 1;
	}
	else
	{
		// No perspective.
		perspective = new Vector4(0,0,0,1);
	}

	// Next take care of translation
	translate = new Vector4(matrix.m41, matrix.m42, matrix.m43);

	matrix.m41 = 0;
	matrix.m42 = 0;
	matrix.m43 = 0;	
	
	// Now get scale and shear. 'row' is a 3 element array of 3 component vectors
	row = [
		new Vector4(), new Vector4(), new Vector4()
	];
	
	for (i = 1; i <= 3; i++)
	{
		row[i-1].x = matrix['m'+i+'1'];
	    row[i-1].y = matrix['m'+i+'2'];
	    row[i-1].z = matrix['m'+i+'3'];
	}

	// Compute X scale factor and normalize first row.
	scale = new Vector4();
	skew = new Vector4();
	
	scale.x = row[0].length();
	row[0] = row[0].normalise();
	
	// Compute XY shear factor and make 2nd row orthogonal to 1st.
	skew.x = row[0].dot(row[1]);
	row[1] = row[1].combine(row[0], 1.0, -skew.x);
	
	// Now, compute Y scale and normalize 2nd row.
	scale.y = row[1].length();
	row[1] = row[1].normalise();
	skew.x /= scale.y;
	
	// Compute XZ and YZ shears, orthogonalize 3rd row
	skew.y = row[0].dot(row[2]);
	row[2] = row[2].combine(row[0], 1.0, -skew.y);
	skew.z = row[1].dot(row[2]);
	row[2] = row[2].combine(row[1], 1.0, -skew.z);
	
	// Next, get Z scale and normalize 3rd row.
	scale.z = row[2].length();
	row[2] = row[2].normalise();
	skew.y /= scale.z;
	skew.y /= scale.z;
	
	// At this point, the matrix (in rows) is orthonormal.
	// Check for a coordinate system flip.  If the determinant
	// is -1, then negate the matrix and the scaling factors.
	pdum3 = row[1].cross(row[2])
	if (row[0].dot(pdum3) < 0)
	{
		for (i = 0; i < 3; i++)
		{
	        scale.x *= -1;
	        row[i].x *= -1;
	        row[i].y *= -1;
	        row[i].z *= -1;	
		}
	}

	// Now, get the rotations out
	rotate = new Vector4();
	rotate.y = Math.asin(-row[0].z);
	if (Math.cos(rotate.y) != 0)
	{
		rotate.x = Math.atan2(row[1].z, row[2].z);
		rotate.z = Math.atan2(row[0].y, row[0].x);
	}
	else
	{
		rotate.x = Math.atan2(-row[2].x, row[1].y);
		rotate.z = 0;
	}
	
	return new CSSMatrixDecomposed({
		perspective: perspective,
		translate: translate,
		skew: skew,
		scale: scale,
		rotate: rotate
	});
};


})();;

/**
 * @preserve
 * Shifty v0.1.3 - A teeny tiny tweening engine in JavaScript. 
 * By Jeremy Kahn - jeremyckahn@gmail.com
 * For instructions on how to use Shifty, please consult the README: https://github.com/jeremyckahn/tweeny/blob/master/README.md
 * MIT Lincense.  This code free to use, modify, distribute and enjoy.
 */

(function(b){function a(){return+new Date}function f(a,c){for(var d in a)a.hasOwnProperty(d)&&c(a,d)}function j(a,c){f(c,function(c,e){a[e]=c[e]});return a}function k(a,c){f(c,function(c,e){typeof a[e]==="undefined"&&(a[e]=c[e])});return a}function g(a,c,d){var e,a=(a-c.timestamp)/c.duration;for(e in d.current)d.current.hasOwnProperty(e)&&c.to.hasOwnProperty(e)&&(d.current[e]=c.originalState[e]+(c.to[e]-c.originalState[e])*c.easingFunc(a));return d.current}function m(a,c,d,e){var b;for(b=0;b<c[a].length;b++)c[a][b].apply(d,
e)}function i(a,c,d){f(b.Tweenable.prototype.filter,function(e,b){e[b][a]&&e[b][a].apply(c,d)})}function n(h,c){var d;d=a();d<h.timestamp+h.duration&&c.isAnimating?(i("beforeTween",h.owner,[c.current,h.originalState,h.to]),g(d,h,c),i("afterTween",h.owner,[c.current,h.originalState,h.to]),h.hook.step&&m("step",h.hook,h.owner,[c.current]),h.step.call(c.current),c.loopId=setTimeout(function(){n(h,c)},1E3/h.fps)):h.owner.stop(!0)}function l(){this.init=function(a){a=a||{};this._hook={};this._tweenParams=
{owner:this,hook:this._hook};this._state={};this._state.current=a.initialState||{};this.fps=a.fps||30;this.easing=a.easing||"linear";this.duration=a.duration||500;return this};this.tween=function(h,c,d,e,b){var f=this;if(!this._state.isAnimating)return this._state.loopId=0,this._state.pausedAtTime=null,c?(this._tweenParams.step=function(){},this._state.current=h||{},this._tweenParams.to=c||{},this._tweenParams.duration=d||this.duration,this._tweenParams.callback=e||function(){},this._tweenParams.easing=
b||this.easing):(this._tweenParams.step=h.step||function(){},this._tweenParams.callback=h.callback||function(){},this._state.current=h.from||{},this._tweenParams.to=h.to||h.target||{},this._tweenParams.duration=h.duration||this.duration,this._tweenParams.easing=h.easing||this.easing),this._tweenParams.timestamp=a(),this._tweenParams.easingFunc=this.formula[this._tweenParams.easing]||this.formula.linear,k(this._state.current,this._tweenParams.to),k(this._tweenParams.to,this._state.current),i("tweenCreated",
this._tweenParams.owner,[this._state.current,this._tweenParams.originalState,this._tweenParams.to]),this._tweenParams.originalState=j({},this._state.current),this._state.isAnimating=!0,setTimeout(function(){n(f._tweenParams,f._state)},1E3/this.fps),this};this.to=function(a,c,d,e){typeof c==="undefined"?(a.from=this._state.current,this.tween(a)):this.tween(this._state.current,a,c,d,e);return this};this.get=function(){return this._state.current};this.set=function(a){this._state.current=a||{}};this.stop=
function(a){clearTimeout(this._state.loopId);this._state.isAnimating=!1;a&&(j(this._state.current,this._tweenParams.to),this._tweenParams.callback.call(this._state.current));return this};this.pause=function(){clearTimeout(this._state.loopId);this._state.pausedAtTime=a();this._state.isPaused=!0;return this};this.resume=function(){var a=this;this._state.isPaused&&(this._tweenParams.timestamp+=this._state.pausedAtTime-this._tweenParams.timestamp);setTimeout(function(){n(a._tweenParams,a._state)},1E3/
this.fps);return this};this.hookAdd=function(a,c){this._hook.hasOwnProperty(a)||(this._hook[a]=[]);this._hook[a].push(c)};this.hookRemove=function(a,c){var d;if(this._hook.hasOwnProperty(a))if(c)for(d=this._hook[a].length;d>=0;d++)this._hook[a][d]===c&&this._hook[a].splice(d,1);else this._hook[a]=[]};return this}l.prototype.filter={};l.util={now:a,each:f,tweenProps:g,applyFilter:i,simpleCopy:j};l.prototype.formula={linear:function(a){return a}};b.Tweenable=l})(this);
(function(b){b.Tweenable.util.simpleCopy(b.Tweenable.prototype.formula,{easeInQuad:function(a){return Math.pow(a,2)},easeOutQuad:function(a){return-(Math.pow(a-1,2)-1)},easeInOutQuad:function(a){if((a/=0.5)<1)return 0.5*Math.pow(a,2);return-0.5*((a-=2)*a-2)},easeInCubic:function(a){return Math.pow(a,3)},easeOutCubic:function(a){return Math.pow(a-1,3)+1},easeInOutCubic:function(a){if((a/=0.5)<1)return 0.5*Math.pow(a,3);return 0.5*(Math.pow(a-2,3)+2)},easeInQuart:function(a){return Math.pow(a,4)},easeOutQuart:function(a){return-(Math.pow(a-
1,4)-1)},easeInOutQuart:function(a){if((a/=0.5)<1)return 0.5*Math.pow(a,4);return-0.5*((a-=2)*Math.pow(a,3)-2)},easeInQuint:function(a){return Math.pow(a,5)},easeOutQuint:function(a){return Math.pow(a-1,5)+1},easeInOutQuint:function(a){if((a/=0.5)<1)return 0.5*Math.pow(a,5);return 0.5*(Math.pow(a-2,5)+2)},easeInSine:function(a){return-Math.cos(a*(Math.PI/2))+1},easeOutSine:function(a){return Math.sin(a*(Math.PI/2))},easeInOutSine:function(a){return-0.5*(Math.cos(Math.PI*a)-1)},easeInExpo:function(a){return a==
0?0:Math.pow(2,10*(a-1))},easeOutExpo:function(a){return a==1?1:-Math.pow(2,-10*a)+1},easeInOutExpo:function(a){if(a==0)return 0;if(a==1)return 1;if((a/=0.5)<1)return 0.5*Math.pow(2,10*(a-1));return 0.5*(-Math.pow(2,-10*--a)+2)},easeInCirc:function(a){return-(Math.sqrt(1-a*a)-1)},easeOutCirc:function(a){return Math.sqrt(1-Math.pow(a-1,2))},easeInOutCirc:function(a){if((a/=0.5)<1)return-0.5*(Math.sqrt(1-a*a)-1);return 0.5*(Math.sqrt(1-(a-=2)*a)+1)},easeOutBounce:function(a){return a<1/2.75?7.5625*
a*a:a<2/2.75?7.5625*(a-=1.5/2.75)*a+0.75:a<2.5/2.75?7.5625*(a-=2.25/2.75)*a+0.9375:7.5625*(a-=2.625/2.75)*a+0.984375},easeInBack:function(a){return a*a*(2.70158*a-1.70158)},easeOutBack:function(a){return(a-=1)*a*(2.70158*a+1.70158)+1},easeInOutBack:function(a){var b=1.70158;if((a/=0.5)<1)return 0.5*a*a*(((b*=1.525)+1)*a-b);return 0.5*((a-=2)*a*(((b*=1.525)+1)*a+b)+2)},elastic:function(a){return-1*Math.pow(4,-8*a)*Math.sin((a*6-1)*2*Math.PI/2)+1},swingFromTo:function(a){var b=1.70158;return(a/=0.5)<
1?0.5*a*a*(((b*=1.525)+1)*a-b):0.5*((a-=2)*a*(((b*=1.525)+1)*a+b)+2)},swingFrom:function(a){return a*a*(2.70158*a-1.70158)},swingTo:function(a){return(a-=1)*a*(2.70158*a+1.70158)+1},bounce:function(a){return a<1/2.75?7.5625*a*a:a<2/2.75?7.5625*(a-=1.5/2.75)*a+0.75:a<2.5/2.75?7.5625*(a-=2.25/2.75)*a+0.9375:7.5625*(a-=2.625/2.75)*a+0.984375},bouncePast:function(a){return a<1/2.75?7.5625*a*a:a<2/2.75?2-(7.5625*(a-=1.5/2.75)*a+0.75):a<2.5/2.75?2-(7.5625*(a-=2.25/2.75)*a+0.9375):2-(7.5625*(a-=2.625/2.75)*
a+0.984375)},easeFromTo:function(a){if((a/=0.5)<1)return 0.5*Math.pow(a,4);return-0.5*((a-=2)*Math.pow(a,3)-2)},easeFrom:function(a){return Math.pow(a,4)},easeTo:function(a){return Math.pow(a,0.25)}})})(this);
(function(b){function a(a,b){return function(){a();b.shift();if(b.length)b[0]();else b.running=!1}}function f(a,b,g,f,i,n){return function(){g?a.tween(b,g,f,i,n):(b.callback=i,b.from?a.tween(b):a.to(b))}}if(b.Tweenable)b.Tweenable.prototype.queue=function(b,k,g,m,i){if(!this._tweenQueue)this._tweenQueue=[];m=m||b.callback||function(){};m=a(m,this._tweenQueue);this._tweenQueue.push(f(this,b,k,g,m,i));if(!this._tweenQueue.running)this._tweenQueue[0](),this._tweenQueue.running=!0;return this},b.Tweenable.prototype.queueShift=
function(){this._tweenQueue.shift();return this},b.Tweenable.prototype.queuePop=function(){this._tweenQueue.pop();return this},b.Tweenable.prototype.queueEmpty=function(){this._tweenQueue.length=0;return this},b.Tweenable.prototype.queueLength=function(){return this._tweenQueue.length}})(this);
(function(b){function a(a){return parseInt(a,16)}function f(h){b.Tweenable.util.each(h,function(c,b){if(typeof c[b]==="string"&&(m.test(c[b])||i.test(c[b]))){var e;e=c[b];e=e.replace(/#/g,"");e.length===3&&(e=e.split(""),e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2]);e=[a(e.substr(0,2)),a(e.substr(2,2)),a(e.substr(4,2))];c[b]="rgb("+e[0]+","+e[1]+","+e[2]+")"}})}function j(a){var c;c=[];b.Tweenable.util.each(a,function(a,b){typeof a[b]==="string"&&(m.test(a[b])||i.test(a[b])||n.test(a[b]))&&c.push(b)});return c}
function k(a,b){var d,e,i;e=b.length;for(d=0;d<e;d++)i=a[b[d]].match(/(\d+)/g),a["__r__"+b[d]]=+i[0],a["__g__"+b[d]]=+i[1],a["__b__"+b[d]]=+i[2],delete a[b[d]]}function g(a,b){var d,e;e=b.length;for(d=0;d<e;d++)a[b[d]]="rgb("+parseInt(a["__r__"+b[d]],10)+","+parseInt(a["__g__"+b[d]],10)+","+parseInt(a["__b__"+b[d]],10)+")",delete a["__r__"+b[d]],delete a["__g__"+b[d]],delete a["__b__"+b[d]]}var m=/^#([0-9]|[a-f]){3}$/i,i=/^#([0-9]|[a-f]){6}$/i,n=/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)\s*$/i,l;if(b.Tweenable)b.Tweenable.prototype.filter.color=
{tweenCreated:function(a,b,d){f(a);f(b);f(d)},beforeTween:function(a,b,d){l=j(b);k(a,l);k(b,l);k(d,l)},afterTween:function(a,b,d){g(a,l);g(b,l);g(d,l)}}})(this);
(function(b){function a(a){var i;i=[];b.Tweenable.util.each(a,function(a,b){typeof a[b]==="string"&&k.test(a[b])&&i.push(b)});return i}function f(a,b){var f,g;g=b.length;for(f=0;f<g;f++)a[b[f]]=+a[b[f]].replace(k,"")}function j(a,b){var f,g;g=b.length;for(f=0;f<g;f++)a[b[f]]=Math.floor(a[b[f]])+"px"}var k=/px/i,g;if(b.Tweenable)b.Tweenable.prototype.filter.px={beforeTween:function(b,i,j){g=a(i);f(b,g);f(i,g);f(j,g)},afterTween:function(a,b,f){j(a,g);j(b,g);j(f,g)}}})(this);
(function(b){if(b.Tweenable)b.Tweenable.util.interpolate=function(a,f,j,k){var g;if(a&&a.from)f=a.to,j=a.position,k=a.easing,a=a.from;g=b.Tweenable.util.simpleCopy({},a);b.Tweenable.util.applyFilter("tweenCreated",g,[g,a,f]);b.Tweenable.util.applyFilter("beforeTween",g,[g,a,f]);j=b.Tweenable.util.tweenProps(j,{originalState:a,to:f,timestamp:0,duration:1,easingFunc:b.Tweenable.prototype.formula[k]||b.Tweenable.prototype.formula.linear},{current:g});b.Tweenable.util.applyFilter("afterTween",j,[j,a,
f]);return j},b.Tweenable.prototype.interpolate=function(a,f,j){a=b.Tweenable.util.interpolate(this.get(),a,f,j);this.set(a);return a}})(this);
;

/**
 * @preserve 
 * Extra easing functions borrowed from scripty2 (c) 2005-2010 Thomas Fuchs (MIT Licence) 
 * https://raw.github.com/madrobby/scripty2/master/src/effects/transitions/transitions.js
 */

(function(){
	var scripty2 = {
		spring: function(pos) {
			return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
		},

		sinusoidal: function(pos) {
			return (-Math.cos(pos*Math.PI)/2) + 0.5;
		}
	};
	
	// Load the Scripty2 functions
	for(var t in scripty2)
		Tweenable.prototype.formula[t] = scripty2[t];
})();
;

