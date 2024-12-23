/*
	Created by Tech_dog (ebontrop@gmail.com) on 23-Dec-2024 at 05:14:24.022, UTC+4, Batumi, Monday
	This is 'Battery On Wheels' web project modal dialog mouse handler JS implementation file;
*/

function fn_00000c13_eeee_bbbb_6667_000000000004 (_is_dbg = true) {
	return'{00000C13-EEEE-BBBB-6667-000000000004}' ;
}

var __dbg_is_on = true;
var __real_is_on = false;

class Point {
	#_x = 0; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties ;
	#_y = 0;
	constructor(_x  = 0, _y = 0) {
		this.#_x = _x;
		this.#_y = _y;
	}
	set(_x, _y) { this.x = _x; this.y = _y; }

	get x() { return this.#_x; }
	get y() { return this.#_y; }
	set x(_x) { this.#_x = parseInt(_x, 10); }
	set y(_y) { this.#_y = parseInt(_y, 10); }

	_out() {
	if (__dbg_is_on) {
		var s_out = "cls::[Point]>>{x=" + this.x + ";y=" + this.y + "}";
		return s_out;
	}}
}

class evt_data {
	constructor(){
		this.b_set = false;        // current status of this handler: is turned off/on;
		this.offset = new Point(); // a mouse pointer offset regarding position over html element, in this case specified division;
	}
}

var evt_cache = new evt_data;

var evt_mouse = (function(){
		
	function get_frame(){ return document.getElementById("modal-frame"); }

	function on_mouse_down(event) { // https://www.w3schools.com/jsref/event_clientx.asp ; https://www.w3schools.com/jsref/event_offsetx.asp ;
			                        // The clientX value is always greater than the offsetX value relative to the client area of the browser window, 
			                        // since the pointer is located inside the area that can be clicked when the cursor hovers over an element;
		var frame = get_frame();
		if (frame == null || evt_cache.b_set)
			return;

		evt_cache.b_set = true;
//#region _4_debug
		if (__real_is_on) {
			console.log("event.clientX=" + event.clientX);
			console.log("event.clientY=" + event.clientY);

			console.log("frame.offsetLeft=" + frame.offsetLeft);
			console.log("frame.offsetTop =" + frame.offsetTop );

			console.log("event.offsetX=" + event.offsetX);
			console.log("event.offsetY=" + event.offsetY);
		}
//#endregion
		evt_cache.offset.set(
			event.clientX - frame.offsetLeft, // this is x-coord of the object being clicked; perhaps, it is the same as offsetLeft property;
			event.clientY - frame.offsetTop   // the same as above but relating to y-coord and offsetTop property;
		);
		// https://learn.microsoft.com/en-us/microsoft-edge/devtools-guide-chromium/console/api#clear ;
		if (__dbg_is_on) {
			console.clear();
			console.log("cls::[evt_mouse].on_down() >> offset{x=" + evt_cache.offset.x + ";y=" + evt_cache.offset.y + "};");
		}
	}

	function on_mouse_move(event) {

		event.preventDefault();

		var frame = get_frame();
		if (frame == null || !evt_cache.b_set)   // if no mouse event handler is set, returns immediately;
			return;

		var left = (event.clientX - evt_cache.offset.x) /*+ "px"*/;
		var top  = (event.clientY - evt_cache.offset.y) /*+ "px"*/;
		if (__real_is_on)
		console.log("cls::[evt_mouse].on_move() >> {left=" + left + ";top=" + top + "};");

		frame.style.left = left + "px";
		frame.style.top  = top  + "px";
	}

	function on_mouse_up () {
		evt_cache.b_set = false;
	}

	var handle = function() {
		var frame = get_frame();
		if (frame == null)
			return false;  // no handle occurs due to error of finding required division;

		frame.addEventListener("mousedown", function(evt) { on_mouse_down(evt); }, true);

		document.addEventListener("mousemove", on_mouse_move, true);
		document.addEventListener("mouseup", function() { on_mouse_up(); }, true);
		if (__dbg_is_on)
		console.log("cls::[evt_mouse].handle() is installed;");
	}
	var release = function() {
	}

	return { handle, release };

})();