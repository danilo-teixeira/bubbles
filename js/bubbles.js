/*
 * @author : Danilo Teixeira
 * @GitHub : https://github.com/danilo-teixeira
 * @Class : bubbles
 * bubbles.js copyright 2013
 */

!function( w, d ) {

	var bubbles = {

		layer : null,
		audioExplode : null,
		ctx : null,
		wind : false,
		colors : [ "#ffffff", "#f00000", "#ff0", "#993399", "#669900", "#ff6600", "#0099cc", "#ea4c88" ],
		widthCanvas : 0,
		heightCanvas : 0,
		score : 0,
		color : null,
		WIND_FORCE : 5,
		GRAVIDY_FORCE : 0.2,
		SPRING : 1,
		BOUNCE : -0.5,

	}

	bubbles.init = function() {

		bubbles.layer = d.querySelector( "#layer" );
		bubbles.audioExplode = d.querySelector( "#explode" );
		bubbles.ctx = bubbles.layer.getContext( "2d" );

		bubbles.resize();

		bubbles.layer.addEventListener( "mousemove", bubbles.mouse.move, false );
		bubbles.layer.addEventListener( "mousedown", bubbles.mouse.down, false );
		bubbles.layer.addEventListener( "mouseup", bubbles.mouse.up, false );
		w.addEventListener( "resize", bubbles.resize, false );

		bubbles.audioExplode.load();
		bubbles.create.bubble( 30 );
		
		bubbles.color = bubbles.colors[ bubbles.util.random( 0, bubbles.util.len( bubbles.colors ) ) << 0 ];
		
		bubbles.animate();

	}

	bubbles.resize = function() {

		bubbles.widthCanvas = w.innerWidth;
		bubbles.heightCanvas = w.innerHeight;
		bubbles.layer.width = bubbles.widthCanvas;
		bubbles.layer.height = bubbles.heightCanvas;

	}

	bubbles.clear = function() {

		bubbles.ctx.clearRect( 0, 0, bubbles.widthCanvas, bubbles.heightCanvas );

	}

	bubbles.animate = function() {

		bubbles.clear();
		bubbles.draw.bubbles();
		bubbles.draw.particles();
		bubbles.draw.score();
		bubbles.draw.target();
		requestAnimationFrame( bubbles.animate );

	}

	bubbles.bubbleExplodes = function() {

		bubbles.create.bubblesContent.map( function( element ) {

			var colision = bubbles.mouse.colision( element.x, element.y, element.radius );

			if( colision ) {

				bubbles.layer.style.cursor = "pointer";

				if( bubbles.mouse.isDown ) {

					bubbles.mouse.isDown = false;

					bubbles.audioExplode.play();
					bubbles.create.bubblesContent.splice( bubbles.create.bubblesContent.indexOf( element ), 1 );
					bubbles.create.bubble( 1 );
					bubbles.create.particlesContent.push( bubbles.create.particle( element.x, element.y, element.radius, element.color ) );
					
					bubbles.wind = !!Math.round( bubbles.util.random( 0, 1 ) );

				}

			}

		} );

	}

	bubbles.check = {

		/**
		 *@param {Object} element
		 */
		particlesPosition : function( element ) {

			var top = 0;
			var bottom = bubbles.heightCanvas;
			var right = bubbles.widthCanvas;
			var left = 0;

			for( var i = 0; i < bubbles.util.len( element ); i++ ) {
				
				var radius = element[i].radius;

				if( element[i].y + radius > bottom || element[i].y - radius < top || element[i].x + radius > right || element[i].x - radius < left ) {

					element.splice( i, 1 );
				
				}

			}

			// verifica se o array está vazio e apaga
			if( bubbles.util.len( element ) == 0 ) {

				bubbles.create.particlesContent.splice( bubbles.create.particlesContent.indexOf( element ), 1 );

			}

		},
		/**
		 *@param {Object} element
		 *@param {Number} i
		 */
		bubblesPosition : function( element, i ) {

			for( var j = i + 1, len = bubbles.util.len( bubbles.create.bubblesContent ); j < len; j++ ) {

				var item = bubbles.create.bubblesContent[j];
				var dist = element.radius + item.radius;
				var colision = bubbles.util.colision( item.x, item.y, element.x, element.y );

				if( colision < dist ) {

					var dx = item.x - element.x;
					var dy = item.y - element.y;
					var angle = Math.atan2( dy, dx );
					var tx = element.x + Math.cos( angle ) * dist;
					var ty = element.y + Math.sin( angle ) * dist;
					var ax = ( tx - item.x ) * bubbles.SPRING * 0.5;
					var ay = ( ty - item.y ) * bubbles.SPRING * 0.5;
					var depth = ( dist - colision ) / ( colision + 1 );

					element.x += ( element.x - item.x ) * depth * 0.5;
					element.y += ( element.y - item.y ) * depth * 0.5;

					element.vx -= ax;
					element.vy -= ay;

					item.vx += ax;
					item.vy += ay;

				}

			}

			element.vy -= bubbles.GRAVIDY_FORCE;
			element.x += element.vx;
			element.y += element.vy;
			
			if( element.y + element.radius > bubbles.heightCanvas ) {

				element.y = bubbles.heightCanvas - element.radius;
				element.vy *= bubbles.BOUNCE;

			} else
			if( element.y - element.radius < 0 ) {

				element.y = element.radius;
				element.vy *= bubbles.BOUNCE;

			}

			if( element.x + element.radius > bubbles.widthCanvas ) {

				element.x = bubbles.widthCanvas - element.radius;
				element.vx *= bubbles.BOUNCE;

			} else
			if( element.x - element.radius < 0 ) {

				element.x = element.radius;
				element.vx *= bubbles.BOUNCE;

			}
			
			
		}

	}

	bubbles.util = {

		/**
		 * @param {Number} min
		 * @param {Number} max
		 * @return {Number} um valor aleatorio entre o min e max
		 */
		random : function( min, max ) {

			return min + Math.random() * ( max - min );

		},
		/**
		 * @param {Object} obj
		 * @retunr {Number} length do obj
		 */
		len : function( obj ) {

			return obj.length;

		},
		/**
		 * @param {Number} x1
		 * @param {Number} y1
		 * @param {Number} x2
		 * @param {Number} y2
		 * @return {Number}
		 */
		colision : function( x1, y1, x2, y2 ) {

			var x = x1 - x2;
			var y = y1 - y2;

			return Math.sqrt( x * x + y * y );

		}

	}

	bubbles.mouse = {

		isDown : false,
		x : 0,
		y : 0,
		/**
		 * @param {Object} e
		 */
		move : function( e ) {

			bubbles.mouse.x = e.pageX;
			bubbles.mouse.y = e.pageY;
			bubbles.layer.style.cursor = "default";

			bubbles.bubbleExplodes();

			e.preventDefault();
			
		},
		down : function() {

			if( !bubbles.mouse.isDown ) {

				bubbles.mouse.isDown = true;

			}

			bubbles.bubbleExplodes();

		},
		up : function() {

			if( bubbles.mouse.isDown ) {
				
				bubbles.mouse.isDown = false;

			}

		},
		/**
		 * @param {Number} x
		 * @param {Number} y
		 * @param {Number} radius
		 * @return {Boolean}
		 */
		colision : function( x, y, radius ) {


			var colision = bubbles.util.colision( bubbles.mouse.x, bubbles.mouse.y, x, y );

			if( colision < radius ) {

				return true;

			} else {

				return false;

			}

		}
	}

	bubbles.create = {

		bubblesContent : [],
		particlesContent : [],
		/**
		 * @param {Number} len
		 */
		bubble : function( len ) {

			for( var i = 0; i < len; i++ ) {
				
				var bubble = {

					radius : bubbles.util.random( 30, 60 ),
					x : bubbles.util.random( 0, bubbles.widthCanvas ),
					y : bubbles.util.random( bubbles.heightCanvas, bubbles.heightCanvas ),
					vx : bubbles.util.random( -3, 3 ),
					vy : bubbles.util.random( -3, 3 ),
					color : bubbles.colors[ bubbles.util.random( 0, bubbles.util.len( bubbles.colors ) ) << 0 ]

				}

				bubbles.create.bubblesContent.push( bubble );

			}

		},
		/**
		 * @param {Number} x
		 * @param {Number} y
		 * @param {Number} radius
		 * @param {String} color
		 * @return {Array} 
		 */
		particle : function( x, y, radius, color ) {

			var particles = [];

			for( var i = 0, len = radius * 2; i < len; i++ ) {

				var particle = {
				
					radius : bubbles.util.random( 0, 2 ),
					x : bubbles.util.random( x - radius, x + radius ),
					y : bubbles.util.random( y - radius, y + radius ),
					vy : bubbles.util.random( -3, 3 ),
					color : color

				}

				particles.push( particle );

			}

			return particles;

		}
	}

	bubbles.draw = {

		bubbles : function() {

			bubbles.create.bubblesContent.forEach( function( element, i ) {
				
				bubbles.ctx.beginPath();
				bubbles.ctx.strokeStyle = '#fff';
				bubbles.ctx.globalAlpha = .5;
				bubbles.ctx.fillStyle = element.color;
				bubbles.ctx.arc( element.x, element.y, element.radius, 0, Math.PI * 2, false )
				bubbles.ctx.fill();
				bubbles.ctx.stroke();
				bubbles.ctx.restore()

				bubbles.check.bubblesPosition( element, i );

			} );

		},
		score : function() {

			bubbles.ctx.beginPath();
			bubbles.ctx.fillStyle = bubbles.color;
			bubbles.ctx.font = "30px Calibri";
			bubbles.ctx.fillText( bubbles.score, 20, bubbles.heightCanvas - 20 );
			bubbles.ctx.fill();

		},
		target : function() {

			bubbles.ctx.beginPath();
			bubbles.ctx.arc( 100, bubbles.heightCanvas - 35, 30, 0, Math.PI * 2, false );
			bubbles.ctx.fillStyle = bubbles.color;
			bubbles.ctx.fill();

		},
		particles : function() {

			bubbles.create.particlesContent.map( function( element ) {

				bubbles.check.particlesPosition( element );

				for( var i = 0, len = bubbles.util.len( element ); i < len; i++ ) {

					bubbles.ctx.beginPath();
					bubbles.ctx.fillStyle = element[i].color;
					bubbles.ctx.arc( element[i].x, element[i].y, element[i].radius, 0, Math.PI * 2, false )
					bubbles.ctx.fill();
					bubbles.ctx.restore();

					element[i].vy += bubbles.GRAVIDY_FORCE + element[i].radius;
					element[i].y += element[i].vy;

					if( bubbles.wind ) {

						element[i].x += bubbles.WIND_FORCE - element[i].radius;

					} else {

						element[i].x -= bubbles.WIND_FORCE - element[i].radius;

					}
					
				}

			} );

		}

	}

	w.bubbles = bubbles;

}( window, document );

/**
 * requestAnimationFrame polyfill by Erik Möller
 * Fixes from Paul Irish and Tino Zijdel
 *
 * @see http://goo.gl/ZC1Lm
 * @see http://goo.gl/X0h6k
 */
(function(){for(var d=0,a=["ms","moz","webkit","o"],b=0;b<a.length&&!window.requestAnimationFrame;++b)window.requestAnimationFrame=window[a[b]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[a[b]+"CancelAnimationFrame"]||window[a[b]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(b){var a=Date.now(),c=Math.max(0,16-(a-d)),e=window.setTimeout(function(){b(a+c)},c);d=a+c;return e});window.cancelAnimationFrame||(window.cancelAnimationFrame=function(a){clearTimeout(a)})})();

