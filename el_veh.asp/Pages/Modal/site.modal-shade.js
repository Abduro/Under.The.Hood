/*
	Created by Tech_dog (ebontrop@gmail.com) on 23-Dec-2024 at 05:14:24.037, UTC+4, Batumi, Monday
	This is 'Battery On Wheels' web project draw shade layer wrapper JS implementation file;
*/

function fn_00000c13_eeee_bbbb_6667_000000000003 (_is_dbg = true) {
	return'{00000C13-EEEE-BBBB-6667-000000000003}' ;
}

var __dbg_is_on = true;

class cls_layer {
	static get(){ return document.getElementById("shade-layer"); }
}

class cls_color {
	#n_rgb = 0;
	constructor(_clr = 0) {
		this.rgb = _clr;
	}

	hex() { // https://stackoverflow.com/questions/51009465/how-do-you-convert-a-hexadecimal-of-type-string-to-number-in-js ;
		return ("#" + this.rgb.toString(16));
	}

	get rgb() { return this.#n_rgb; }
	set rgb(_clr) {
		this.set(_clr, true);
	}

	set (_clr, _b_apply = true) {
		var  n_clr = parseInt(_clr, 10);
		var  b_changed = this.rgb != n_clr;
		if (!b_changed)
			return b_changed;

		this.#n_rgb = n_clr;
		if (!_b_apply)
			return b_changed;

		var lay = cls_layer.get();
		if (lay) {
			lay.style.backgroundColor = this.hex();
		}

		return b_changed;
	}

	_out() {
		if (__dbg_is_on) {
			var s_out = "cls::[cls_color]>>{rgb=" + this.hex() + "};";
			return s_out;
		}
	}
}

class cls_opacity {
	#n_percent = 0; // from 0% (transparent) to 100% (fully opaque);
	constructor(_percent = 100) { this.set(_percent); }

	get() { return this.#n_percent; }
	set(_percent, _b_apply = true) { // returns true in case the opacity value is changed;

		var n_new = parseInt(_percent, 10);

		if (n_new < 0)
			n_new = 0;
		if (n_new > 100)
			n_new = 100;

		var b_changed = n_new != this.get();
		if (b_changed)
			this.#n_percent = n_new;
		
		
		if (!_b_apply)
			return b_changed;

		var lay = cls_layer.get();
		if (lay) {
			lay.style.opacity = (this.get()/100) + "";
			lay.style.filter  = "alpha(opacity=" + this.get() + ")";
		}

		return b_changed;
	}

	transparen() { return this.set(  0); } // returns true in case whe this opacity value is changed;
	translucen() { return this.set( 50); } // returns true in case whe this opacity value is changed;
	opaque    () { return this.set(100); } // returns true in case whe this opacity value is changed;

	_out() {
		if (__dbg_is_on) {
			var s_out = "cls::[shade].opacity()>>{value=" + this.get() + "%}";
			return s_out;
		}
	}
}
// https://stackoverflow.com/questions/39904569/transparent-iframe-over-another-iframe ; ::works as excpected ;
// https://stackoverflow.com/questions/12911428/z-index-does-not-work-in-internet-explorer-with-pdf-in-iframe ; ::layout of windowless elements;
class cls_shade {

	#o_color   = new cls_color();
	#o_opacity = new cls_opacity();

	get color()   { return this.#o_color; }
	get opacity() { return this.#o_opacity; }

	_out(){
		if (__dbg_is_on) {
			var s_out  = "cls::[cls_shade]>>{"
			           + this.color._out()
			           + this.opacity._out()
			           + ";visible=" + this.is_set
			           + "}";
			return s_out;
		}
	}

	#b_is_set = false;
	get is_set() { return this.#b_is_set; }

	hide () {
		var lay = cls_layer.get();
		if (lay) {
			if (!this.#b_is_set)
				return;
			this.#b_is_set = false; lay.style.display = "none" ;
		}
		return this.is_set;
	}

	show () {
		var lay = cls_layer.get();
		if (lay) {
			if (this.is_set)
				return false; // no layer visibility status is changed;
			this.#b_is_set = true; lay.style.display = "block" ; lay.focus();
		}
		return this.is_set;
	}

	set (_clr = 0, _opacity = 100) { // sets background color and its opacity value in one call;
		this.color.set(_clr);
		this.opacity.set(_opacity);
	}
}
