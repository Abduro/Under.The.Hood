/*
	Created by Tech_dog (ebontrop@gmail.com) on 7-Dec-2024 at 22:42:01.837, UTC+7, Novosibirsk, Saturday
	This is electric vehicle web project main frame modal dialog JS implementation file;
*/

function fn_00000c13_eeee_bbbb_6667_000000000005 (_is_dbg = true) {
	return'{00000C13-EEEE-BBBB-6667-000000000005}' ;
}

var __dbg_is_on = true;

//#region primitive shape objects ;

// ToDo: the comparisons in the code must be reviewed for following by simple rules that are described in the next article:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness >> being careful;

class el_coord {
	#_value = 0; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties ;

	constructor(_val = 0) { this.#_value = _val; } // looks like there is no way for declaring a class with several constructors; fkn big deal !
//	constructor(_coord) { this.assign(_coord); }   // https://stackoverflow.com/questions/3220721/javascript-pattern-for-multiple-constructors ;

	assign (_rhs) {
		if (rhs == null || !(rhs instanceof el_coord)) {
			if (__dbg_is_on) console.log("cls::[el_coord].assign(): wrong parameter type;");
			return false;
		}
		this.#_value = rhs.value; return true;
	}
	
	get value() { return this.#_value; }
	set value(_val) { this.#_value = parseInt(_val); }

	get _v() { return this.value; }
	set _v(v){ this.value = v; }

	_out() {
		if (__dbg_is_on) {
			var s_out = "cls::[el_coord]>>{value=" + this.value + "}";
			return s_out;
		}
	}

	static create_from(_rhs) {
		return (new el_coord()).assign(_rhs);
	}
}

// https://stackoverflow.com/questions/1948809/setting-one-object-equal-to-another-object-with-the-assignment-operator-in-javas ;
class el_point {
	#o_x = new el_coord();
	#o_y = new el_coord();

	constructor(_x  = 0, _y = 0) {
		this.#o_x._v = _x;
		this.#o_y._v = _y;
	}

//	constructor(_point) { if (null!=_point && typeof el_point) this.assign(_point); }

	assign(_rhs) {
		if (rhs == null || !(rhs instanceof el_point)) {
			if (__dbg_is_on) console.log("cls::[el_point].assign(): wrong parameter type;");
			return false;
		}
		this.#o_x = rhs.#o_x;
		this.#o_y = rhs.#o_y; return true;
	}

	set(_x, _y) { this.x = _x; this.y = _y; }

	get x() { return this.#o_x; }
	get y() { return this.#o_y; }
	set x(_x) { this.#o_x = parseInt(_x, 10); }
	set y(_y) { this.#o_y = parseInt(_y, 10); }

	_out() {
		if (__dbg_is_on) {
			var s_out = "cls::[el_point]>>{x="
			          + this.#o_x._out() + ";y="
			          + this.#o_y._out() + ";}";
			return s_out;
		}
	}

	static create_from(_rhs) {
		return (new el_point()).assign(_rhs);
	}
}

class el_Id {
	#_id = "";
	constructor(_id = "") { this.#_id = _id; }    // no trim is applied and input argument value is used as it's set;

	get value() { return this.#_id; }
	set value(_val="") { this.#_id = _val + ""; } // in order to avoid passing the null or empty value the input value is concatenated with empty string ;

	get valid() { return !(null == this.value || !this.value.length ); }
			
	is_set () { return this.valid; }
	
	assign (rhs) {
		if (rhs == null || !(rhs instanceof el_Id)) {
			if (__dbg_is_on) console.log("cls::[el_point].assign(): wrong parameter type;");
			return false;
		}
		this.#_id = rhs.value();
		console.log("[dbg] assign function is completed;");
	}

	_out() {
		if (__dbg_is_on) {
			var s_out  = "cls::[el_Id]>>{valid=" + this.valid + "; value=" + this.value + "};";
			return s_out;
		}
	}

	static create_from(_id) { return (new Id()).assign(_id); }
}

class el_target {
	#o_id    = new el_Id();
	#o_cache = null;      // target or wrapped html object that is retrieved by html object identifier value;

	constructor(_id = "") { this.#o_id.value = _id; /*this.#o_id.assign(_id); */ }

	cached (_b_refresh) { // get cached html object received in the first success call of this method; may update the cache if necessary;

		if (!this.#o_id.valid) {
			return this.object; // may return null object in case if it is not retrieved yet;
		}
		if (true == _b_refresh || null == this.#o_cache) {
			this.#o_cache = document.getElementById(this.id.value);
		}
		return this.#o_cache;
	}

	// this property sets the ID value and nothing more, looks like useless;
	set id(_id) { if (null == _id || !(_id instanceof el_Id)) this.#o_id.value = ""; else this.#o_id = _id; }
	get id()    { return this.#o_id; } // gets the reference to identifier object;
	get_id()    { return this.#o_id; } // what is the difference: okay, a couple of curve parentheses required to be typed ;)

	get object () { return this.#o_cache; }
	get_object (_b_update = true) { return this.cached(_b_update); }
			
	get valid() { return (null != this.object); }

	_out() {
		if (__dbg_is_on) {
		var s_out  = "cls::[el_target]>>{"
		           + "id=" + this.id._out()
		           + "valid=" + this.valid + ";}";
		return s_out;
		}
	}
}
// https://www.w3schools.com/js/js_class_inheritance.asp ;
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain ;
class el_left extends el_coord {

	#o_el = new el_target();

	constructor(_x = 0) { super(_x); }

	#get_target(_b_refresh) {
		var object = this.#o_el.cached(_b_refresh);
		return object;
	}

	get (_b_refresh = true) {
	
		var element = this.#get_target(_b_refresh);
		if (element) {
			super.value = parseInt(element.style.left, 10); // must be called after creating the element/div, otherwise, zero value forever;
		}
		return super.value;
	}

	get target() { return this.#o_el; }
	set target(_id = "") {

		var b_refresh = (_id.length && _id !== this.#o_el.id.value);
		if (b_refresh) {
			this.#o_el.id.value = _id;
			this.#o_el.cached(b_refresh);
		}
	}

	get x() { return super.value; }

	_out() {
		if (__dbg_is_on) {
		var s_out  = "cls::[el_left]>>{"
		           + "id=" + this.target.id._out()
		           + "value=" + super.value + "px;}";
		return s_out;
		}
	}
}

class el_position {
	#o_el   = new el_target(); // this is target element object;
	#n_left = 0; #n_top = 0; #n_right = 0; #n_bottom = 0;

	constructor(_left = 0, _top = 0, _right = 0, _bottom = 0) { this.#n_bottom = _bottom; this.#n_left = _left; this.#n_right = _right; this.#n_top = _top; }

	get bottom() { return this.#n_bottom; } set bottom(_y) { this.#n_bottom = parseInt(_y, 10); }
	get left  () { return this.#n_left;   } set left  (_x) { this.#n_left   = parseInt(_x, 10); }
	get right () { return this.#n_right;  } set right (_x) { this.#n_right  = parseInt(_x, 10); }
	get top   () { return this.#n_top ;   } set top   (_y) { this.#n_top    = parseInt(_y, 10); }

	height() { return (this.bottom - this.top); }
	width () { return (this.right - this.left); }

	get target() { return this.#o_el; }
	set target(_id = "") {

		var b_refresh = (_id.length && _id !== this.#o_el.id.value);
		if (b_refresh) {
			this.#o_el.id.value = _id;
			this.#o_el.cached(b_refresh);
		}
	}

	#get_target(_b_refresh) {
		var object = this.#o_el.cached(_b_refresh);
		return object;
	}

	get (_b_refresh = true) { // must be called after creating the element/div, otherwise, zero values forever;
	
		var element = this.#get_target(_b_refresh);
		if (element) {
			var bound_rect = element.getBoundingClientRect(); // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect

			this.bottom = bound_rect.bottom;
			this.left   = bound_rect.left  ;
			this.right  = bound_rect.right ;
			this.top    = bound_rect.top   ;

			super.value = parseInt(element.style.left, 10);   
		}
		return super.value;
	}

	_out() {
		if (__dbg_is_on) {
			var s_out  = "cls::[el_position]>>"
			           + "{ l=" + this.left
			           + "; t=" + this.top
			           + "; r=" + this.right
			           + "; b=" + this.bottom + " }";
			return s_out;
		}
	}
}

var shape = (function __start(){

	var coord  = new el_coord(13);
	var point  = new el_point(7, 6);
	var el_id  = new el_Id(fn_00000c13_eeee_bbbb_6667_000000000002());
	var target = new el_target(el_id.value);

	var x_left = new el_left();
	var el_pos = new el_position();

	return { coord, point, el_id, target, x_left, el_pos };

})();


//#endregion