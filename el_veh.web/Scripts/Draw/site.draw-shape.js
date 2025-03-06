/*
	Created by Tech_dog (ebontrop@gmail.com) on 7-Dec-2024 at 21:56:53.332, UTC+7, Novosibirsk, Saturday;
	This is electric vehicle web project draw primitive shape wrapper JS implementation file;
*/

function fn_00000c13_eeee_bbbb_6667_000000000001 (_is_dbg = true) {
	alert('{00000C13-EEEE-BBBB-6667-000000000001}');
}
function fn_00000c13_eeee_bbbb_6667_000000000002 (_is_dbg = true) {
	return'{00000C13-EEEE-BBBB-6667-000000000002}' ;
}

var __dbg_is_on = true;

class _tabs {
	static get (_num = 0) { var s_tabs = ""; for (let i_ = 0; i_ < _num; i_++) s_tabs += "\t"; return s_tabs; }
}

// ToDo: the comparisons in the code must be reviewed for following by simple rules that are described in the next article:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness >> being careful;

// this is very simple class for making slim wrapper on primitive/plain data type of number; it is useful for copying, assinment and logging;
class cls_value {
	#n_value = 0; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties ;

	constructor(_n_value = 0) { this.set(_n_value); } // looks like there is no way for declaring a class with several constructors; fkn big deal !
//	constructor(_coord)       { this.assign(_coord);} // https://stackoverflow.com/questions/3220721/javascript-pattern-for-multiple-constructors ;

//	https://stackoverflow.com/questions/1948809/setting-one-object-equal-to-another-object-with-the-assignment-operator-in-javas ;
//	https://docstore.mik.ua/orelly/web/jscript/ch09_03.html ;
	assign (_rhs) {
		if (_rhs == null || !(_rhs instanceof cls_value)) {
			if (__dbg_is_on) console.log("cls::[cls_value].assign(): wrong parameter type;");
			return false;
		}
		this.#n_value = _rhs.get(); return true;
	}
	
	get() { return this.#n_value; }
	set(_n_value = 0) { var n_value = parseInt(_n_value, 10); var b_changed = (this.#n_value != n_value); this.#n_value = n_value; return b_changed; }

	_out() {
		if (__dbg_is_on) {
			var s_out = "cls::[cls_value]=" + this.get() + ";";
			return s_out;
		}
	}

	static create_from(_rhs) {
		return (new cls_value()).assign(_rhs);
	}
}
/*
	height or width attributes of an element cannot have negative values (because it has nonsense in such a context);
	JS is not typed-base language, thus there's wrappers around integer data types like this:

	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array ;

	perhaps it would be better to use the Math.abs() function or bit shift operations, but everything remains stupidly simple;
	the following class has the same implementation as cls_value, but it holds a control over assignment of negative values;
*/
class  u_value {
	#n_u_value = 0;

	constructor(_u_value = 0) { this.set(_u_value); }

	assign (_rhs) {
		if (_rhs == null || !(_rhs instanceof u_value)) {
			if (__dbg_is_on) console.log("cls::[u_value].assign(): wrong parameter type;");
			return false;
		}
		this.#n_u_value = _rhs.get(); return true;
	}

	get() { return this.#n_u_value; }   // gets the value that is supposed to be equal 0 or greater 0, in other words, unsigned value;

	set(_u_value = 0, _b_zero = false) { // sets the value that is supposed to be unsigned one; if b_zero flag is true, current value is set to 0 in case of error;
		const n_value = parseInt(_u_value, 10);
		if (0 > n_value) {
			if (_b_zero)
				this.#n_u_value = 0;
			return false;
		}
			
		this.#n_u_value = n_value;
		return true;
	}

	_out() {
		if (__dbg_is_on) {
			var s_out = "cls::[u_value]=" + this.get() + ";";
			return s_out;
		}
	}

	static create_from(_rhs) {
		return (new u_value()).assign(_rhs);
	}
}

// this is child class of the value one, just for taking a sense for positioning of a figure or an element in 2D space;
class cls_coord extends cls_value {

	constructor(_n_value = 0) { super(_n_value); }

	_out() {
		if (__dbg_is_on) {
			var s_out = "cls::[cls_coord]>>{value=" + super.get() + "}";
			return s_out;
		}
	}
}

// this is an anchor of an element place or position is put in;
class cls_anchor {
	#o_x = new cls_coord(0);
	#o_y = new cls_coord(0);

	constructor(_x  = 0, _y = 0) {
		this.#o_x.set(_x);
		this.#o_y.set(_y);
	}

	assign (_rhs) {
		if (_rhs == null || !(_rhs instanceof cls_pt_dat)) {
			if (__dbg_is_on) console.log("cls::[cls_anchor].assign(): wrong parameter type;");
			return false;
		}
		var b_no_ref = true; // if true it means do not copy the reference to original object;
		if (b_no_ref) {
			this.#o_x.set(_rhs.#o_x.get());
			this.#o_y.set(_rhs.#o_y.get());
		}
		else {
			this.#o_x = _rhs.#o_x;
			this.#o_y = _rhs.#o_y;
		}
		return true;
	}

	set(_x = 0, _y = 0) { this.x = _x; this.y = _y; } // using the default values of input args makes this object clean, i.e. something simlilar to clear();

	get x() { return this.#o_x.get(); } // is intended to return a value of number type, not a reference to an object;
	get y() { return this.#o_y.get(); } // is intended similarly as getting 'x' value;
	set x(_x) { this.#o_x.set(_x); }    // just assigns the x-coord by making a copy by value;
	set y(_y) { this.#o_y.set(_y); }    // just assigns the y-coord by making a copy by value;

	get is_zero() {
		return (false == this.is_valid || (0 == this.x && 0 == this.y));
	}

	get is_valid() {
		if (null == this.#o_x || !(this.#o_x instanceof cls_coord)) {
			if (__dbg_is_on) { console.log("cls::[cls_anchor].is_valid=false: x-coord object invalid;"); } return false;
		}
		if (null == this.#o_y || !(this.#o_y instanceof cls_coord)) {
			if (__dbg_is_on) { console.log("cls::[cls_anchor].is_valid=false: y-coord object invalid;"); } return false;
		}
		return (true);
	}

	_out() {
		if (__dbg_is_on) {
			var s_out = "cls::[cls_anchor]>>{x="
			          + this.#o_x.get() + "; y="
			          + this.#o_y.get() + "}";
			return s_out;
		}
	}

	set_from (_o_el) {

		var rect = new cls_rect_dat();

		var b_result = rect.set_from(_o_el);
		if (b_result == false)
			return b_result;

		b_result = this.set_rect(rect);

		if (__dbg_is_on) {
			console.log("cls::[cls_anchor].set_from()>>{x=" + this.x + ";y=" + this.y +"}");
		}

		return b_result;
	}

	set_rect (_o_rect) {
		var b_is_set = false;

		if (false){}
		else if (_o_rect != null && (_o_rect instanceof cls_rect_dat)) {
			this.set(_o_rect.left.get(), _o_rect.top.get()); b_is_set = true;
		}
		else if (_o_rect != null && (_o_rect instanceof DOMRect)) {
			this.set(_o_rect.x, _o_rect.y); b_is_set = true;
		}
		else if (__dbg_is_on) {
			console.log("cls::[cls_anchor].set_rect(): wrong parameter type;");
		}
		return b_is_set; // ToDo: *important* to distinguish a change data flag and a validity flag, otherwise their mixing leads to logical error;
	}

	static create_from(_rhs) {
		return (new cls_anchor()).assign(_rhs);
	}
}
// this class is just a shortcut for cls_anchor one in order to create a notation for positioning elements in 2D space;
class cls_point extends cls_anchor {
	constructor (_x = 0, _y = 0) { super(_x, _y); }
	_out() {
		if (__dbg_is_on) {
			var s_out = "cls::[cls_point]>>{x="
			          + super.x    + "; y="
			          + super.y    + "}";
			return s_out;
		}
	}
}

// https://en.wikipedia.org/wiki/Display_resolution >> the constant values that are used is outside the value of max screen resolution used these days;
// https://en.wikipedia.org/wiki/Ultra-high-definition_television >> 7680×4320 (8K UHD);

// https://stackoverflow.com/questions/44447847/enums-in-javascript-with-es6 ;
class cls_size_enum {
	static #n_base = +8000; // ToDo: negative value cannot be used due to size object does not accept it;
	// https://stackoverflow.com/questions/17468733/difference-between-width-auto-and-width-100-percent ;
	static get Auto()    { return cls_size_enum.#n_base -1; }
	static get AsIs()    { return cls_size_enum.#n_base -2; }
	static get Percent() { return cls_size_enum.#n_base -3; }

	static is_auto (_n_val = 0) { return (cls_size_enum.Auto == _n_val); } 
	static is_percent(_n_val = 0) { return (cls_size_enum.Percent == _n_val); }

	static to_string (_n_val) {
		if (cls_size_enum.is_auto(_n_val)) return "(auto)";
		if (cls_size_enum.is_percent(_n_val)) return _n_val + "(%)";
		return _n_val + "";
	}
}

// this class is for describing a size of figure, the size is expressed through a height (Y-axis) and a width (X-axis) values in 2D-space, Z-axis is not used yet;
// alternatively, a point may represent the size in cartesian coordinate system (2D), but it is obviously just a playing with notations or words;
class cls_size_dat {
	#o_height = new u_value(0);
	#o_width  = new u_value(0);

	constructor (_w = 0, _h = 0) { this.set(_w,_h); } // plain number data type is used for input args: _w means width, _h means height;

	assign (_rhs) {
		if (_rhs == null || !(_rhs instanceof cls_coord)) {
			if (__dbg_is_on) console.log("cls::[cls_size_dat].assign(): wrong parameter type;");
			return false;
		}
		return this.set(_rhs.w(), _rhs.h());
	}

	get is_valid () {
		if (null == this.#o_height || !(this.#o_height instanceof u_value)) {
			if (__dbg_is_on) { console.log("cls::[cls_size_dat].is_valid=false: invalid height object;"); } return false;
		}
		if (null == this.#o_width || !(this.#o_width instanceof u_value)) {
			if (__dbg_is_on) { console.log("cls::[cls_size_dat].is_valid=false: invalid width object;"); } return false;
		}
		return (true);
	}

	get is_zero() { // https://www.oxfordlearnersdictionaries.com/definition/english/zero_2 ;
		return (false == this.is_valid || 1 > this.height || 1 > this.width);
	}

	set (_w = 0, _h = 0) { // using default values of input args just moves the size to nothing by making element invisible, i.e. empty();
		var b_changed = false;
		if (this.#o_height.set(_h)) b_changed = true;
		if (this.#o_width.set(_w)) b_changed = true;
		return b_changed;
	}

	get height () { return this.#o_height; } get h() { return this.height; }
	get width  () { return this.#o_width ; } get w() { return this.width ; }
	
	_out() {
		if (__dbg_is_on) {
			var s_out = "cls::[cls_size_dat]>>{h=" + cls_size_enum.to_string(this.h.get()) + ";w=" + cls_size_enum.to_string(this.w.get()) + "}";
			return s_out;
		}
	}

	set_from (_o_el) {

		var b_result = cls_target.is_valid(_o_el);
		if (b_result == false)
			return b_result;

		this.height.set(_o_el.style.height, false);
		this.width .set(_o_el.style.width , false);

		return b_result;
	}
}

// a place that is taken by a figure or some thing can be defined as: a point{x|y} of anchor and size of the figure that has a height and width; (2D-space);  
// in english speaking world placing something to somewhere is usually expressed by word 'position' or by using its shortcut 'pos':
class cls_pos_dat {
	#o_anchor = new cls_anchor(0, 0);    // the point to which the element is positioned or anchored;
	#o_size   = new cls_size_dat(0, 0);  // the size of the element, it cannot have negative values for neither a height nor a width;

	constructor () {} // no input args for creating/constructing an object of this class, otherwise the input data may seem difficult to read;

	assign (_rhs) {
		if (_rhs == null || !(_rhs instanceof cls_pos_dat)) {
			if (__dbg_is_on) console.log("cls::[cls_pos_dat].assign(): wrong parameter type;");
			return false;
		}
		this.anchor.assign(_rhs.anchor);
		this.size.assign(_rhs.size);
		return true; // returns true regardless the assignment operations of the objects; it just means that assignment of position object occurred;
	}

	get anchor() { return this.#o_anchor; } get point() { return this.anchor; }
	get size  () { return this.#o_size  ; }

	get is_valid () {
		if (null == this.#o_anchor || !(this.#o_anchor instanceof cls_anchor)) {
			if (__dbg_is_on) {
				console.log("cls::[cls_pos_dat].is_valid=false: invalid anchor object;"); return false;
			}
		}
		if (null == this.#o_size || !(this.#o_size instanceof cls_size_dat)) {
			if (__dbg_is_on) {
				console.log("cls::[cls_pos_dat].is_valid=false: invalid size object;"); return false;
			}
		}
		return (true);
	}

	set (_pt_or_sz) { // looks like not good approach;
		if (null == _pt_or_sz)
			return false;

		if (_pt_or_sz instanceof cls_anchor)   { return this.anchor.assign(_pt_or_sz); }
		if (_pt_or_sz instanceof cls_size_dat) { return this.size.assign(_pt_or_sz); }
	}

	set (_p_pt, _p_sz) {
		var b_changed = false;
		if (null != _p_pt && _p_pt instanceof cls_anchor) { if (this.anchor.assign(_p_pt)) b_changed = true; }
		if (null != _p_sz && _p_sz instanceof cls_size_dat) { if (this.size.assign(_p_sz)) b_changed = true; }

		return b_changed;
	}

	_out(_s_in = "") {
		if (__dbg_is_on) {
			const cs_out = "cls::[cls_pos_dat]>>{"
			             + "\n\t" + _s_in + this.point._out()
			             + "\n\t" + _s_in + this.size._out()
			             + "\n"   + _s_in + "}";
			return cs_out;
		}
	}

	set_from (_o_el) { // gets position data from input html element;

		var b_result = cls_target.is_valid(_o_el);
		if (b_result == false)
			return b_result;

		if (b_result) {
			b_result = this.anchor.set_from(_o_el); if (!b_result && __dbg_is_on) console.log("cls::[cls_pos_dat].set_from()>>#err:anchor set failed;"); }
		if (b_result) {
			b_result = this.size.set_from(_o_el); if (!b_result && __dbg_is_on) console.log("cls::[cls_pos_dat].set_from()>>#err:size set failed;");
		}
		return b_result;
	}

	set_rect (_o_rect) {
		var b_is_set = (null != _o_rect && _o_rect instanceof cls_rect_dat);
		if (b_is_set == false)
			return b_is_set;

		this.anchor.set(_o_rect.left.get(), _o_rect.top.get());
		this.size.set(_o_rect.width, _o_rect.height); 

		return b_is_set;
	}

}

// it may be useful by taking a glance to this URLs:
// https://drafts.fxtf.org/geometry/ ;
// https://developer.mozilla.org/en-US/docs/Web/API/DOMRect ;
class cls_rect_dat {
	#o_left = new cls_value(0);
	#o_top  = new cls_value(0); #o_right = new cls_value(0); #o_bottom = new cls_value(0);

	constructor(_n_l = 0, _n_t = 0, _n_r = 0, _n_b = 0) {
	   this.set(_n_l, _n_t, _n_r, _n_b);
	}

	assign (_rhs) {
		if (_rhs == null || !(_rhs instanceof cls_rect_dat)) {
			if (__dbg_is_on) console.log("cls::[cls_rect_dat].assign(): wrong parameter type;");
			return false;
		}
		this.set(_rhs);
		return true;
	}

	get bottom()  { return this.#o_bottom; }
	get left()    { return this.#o_left;   }
	get top()     { return this.#o_top;    }
	get right()   { return this.#o_right;  }

	get is_valid(){
		if (null == this.#o_bottom || !(this.#o_bottom instanceof cls_value)) {
			console.log("cls::[cls_rect_dat].is_valid=false: invalid bottom edge object;"); return false;
		}
		if (null == this.#o_left || !(this.#o_left instanceof cls_value)) {
			console.log("cls::[cls_rect_dat].is_valid=false: invalid left edge object;"); return false;
		}
		if (null == this.#o_right || !(this.#o_right instanceof cls_value)) {
			console.log("cls::[cls_rect_dat].is_valid=false: invalid right edge object;"); return false;
		}
		if (null == this.#o_top || !(this.#o_top instanceof cls_value)) {
			console.log("cls::[cls_rect_dat].is_valid=false: invalid top edge object;"); return false;
		}
		return (true);
	}

	// sets rectangle side values, returns true in case when at least one side value changes;
	set (_n_l = 0, _n_t = 0, _n_r = 0, _n_b = 0) {
		var b_changed = false;
		if (this.left.set  (_n_l)) b_changed = true;
		if (this.top.set   (_n_t)) b_changed = true;
		if (this.right.set (_n_r)) b_changed = true;
		if (this.bottom.set(_n_b)) b_changed = true;

		return b_changed;
	}

	set_from (_o_el) {
		var b_result = cls_target.is_valid(_o_el);
		if (b_result == false)
			return b_result;

		var rect = _o_el.getBoundingClientRect();
		return this.set_rect(rect);
	}

	// sets rectangle side values from another rectangle that has the same type or from a rectanle object of DOMRect interface type;
	set_rect (_o_rect) {

		var b_is_set = false;

		if (false){}
		else if (_o_rect != null && (_o_rect instanceof cls_rect_dat)) {
			this.set(_o_rect.left.get(), _o_rect.top.get(), _o_rect.right.get(), _o_rect.bottom.get()); b_is_set = true;
		}
		else if (_o_rect != null && (_o_rect instanceof DOMRect)) {
			this.set(_o_rect.x, _o_rect.y, _o_rect.right, _o_rect.bottom); b_is_set = true;
		}
		else if (__dbg_is_on) {
			console.log("cls::[cls_rect_dat].set_rect(): wrong parameter type;");
		}
		return b_is_set; // this is not applicable to apply returned result from this.set(...) method due to it indicates a changing data; 
	}

	_out() {
		if (__dbg_is_on) {
			var s_out = "cls::[cls_rect_dat]>>{" +
				"l=" + this.left.get()   + ";"   +
				"t=" + this.top.get()    + ";"   +
				"r=" + this.right.get()  + ";"   +
				"b=" + this.bottom.get() + "}"   ;
			return s_out;
		}
	}

	get height() { return (this.bottom.get() - this.top.get()); }
	get width () { return (this.right.get() - this.left.get()); }
}

/////////////////////////////////////////////////////////////////////////////
// html element position related class(es);
/////////////////////////////////////////////////////////////////////////////

// this class is to connect or to link position data class [cls_pos_dat] with an html element or target object;
/*
 *	ToDo: inheritance problem: cls_pos_dat represents data plain class that includes cls_size_dat, the latter cannot be used for
 *	      managing html element size due to it is not intended for; in such case setting the size of the element is implemented by
 *	      cls_position class that is not good approach;
 */
class cls_position extends cls_pos_dat {
	
	#o_target = new cls_target();

	static #n_num = 0; // this is this class instances counter for debug log;

	constructor(){
		super();
		cls_position.#n_num += 1;
		if (false) { // for debug purpose only;
			console.log("cls::[cls_position].#{ctor}>>{inst_#=" + cls_position.#n_num + "}");
		}
	}

	assign (_rhs) {
		if (_rhs == null || !(_rhs instanceof cls_position)) {
			if (__dbg_is_on) console.log("cls::[cls_position].assign(): wrong parameter type;");
			return false;
		}
		super.assign(this);
		this.#o_target.assign(_rhs.target);
	}

	get left () { return super.point.x; } set left (_x) { super.point.x = _x; }
	get top  () { return super.point.y; } set top  (_y) { super.point.y = _y; }

	_out() {
		if (__dbg_is_on) {
			var s_out  = "cls::[cls_position]"
			           + "[i_#="   + cls_position.#n_num + "]>>"
			           + "{ tag="  + this.target.id.get()
			           + "; left=" + this.left
			           + "; top="  + this.top
			           + "; "      + super.size._out() + "}";
			return s_out;
		}
	}
	
	get target() { return this.#o_target; } // this is just a references to wrapped html object and not intended for direct update;
	set target(_s_id = "") {                // this property may set the target element identifier and update the target object reference, the cache be used also;
		var b_changed = this.#o_target.set(_s_id);
		if (b_changed == false) {
			return b_changed;
		}
		else {
			return b_changed = this.#o_target.update();
		}
	}

	update (_b_show = true) {
		
		var b_updated = this.#o_target.is_valid;
		if (b_updated == false) {
			if (__dbg_is_on)
				console.log("[#warn] cls_position.update() >> false");
			this.#o_target.update();
			b_updated = this.#o_target.is_valid;
		}

		if (b_updated == false)
			return b_updated;

		if (this.#o_target.get() == null) { // ToDo: it is *required* to found a reason why the target element may have null value!
			this.#o_target.update();
			b_updated = this.#o_target.is_valid;
			if (b_updated == false) {
				if (__dbg_is_on) console.log("[#err] cls_position.update() >> cannot get the element: id=" + this.#o_target.id.get());
				return b_updated;
			}
		}
		this.#o_target.get().style.top  = this.top  + "px";
		this.#o_target.get().style.left = this.left + "px";

		this.#o_target.get().style.height = this.size.height.get() + "px";
		this.#o_target.get().style.width  = this.size.width.get()  + "px";

		if (_b_show)
			this.#o_target.get().style.display = "block" ; // makes the element visible;
		else
			this.#o_target.get().style.display = "none"  ;

		return (b_updated = true);
	}
}
// the shortcut for cls_position class, it is intended for temporary use;
class cls_pos_smp extends cls_position {
	constructor () { super(); }
}

/////////////////////////////////////////////////////////////////////////////
// html element size related classe(es);
/////////////////////////////////////////////////////////////////////////////

class cls_size extends cls_size_dat {

	#o_target = new cls_target();

	static #n_num = 0; // this is this class instances counter for debug log;

	constructor(_w = 0, _h = 0){
		cls_size.#n_num += 1;
		if (false) { // for debug purpose only;
			console.log("cls::[cls_size].#{ctor}>>{inst_#=" + cls_size.#n_num + "}");
		}
		super(_w, _h);
	}

	assign (_rhs) {
		if (_rhs == null || !(_rhs instanceof cls_size)) {
			if (__dbg_is_on) console.log("cls::[cls_size].assign(): wrong parameter type;");
			return false;
		}
		super.assign(this);
		this.#o_target.assign(_rhs.target);
	}

	_out() {
		if (__dbg_is_on) {
		var s_out  = "cls::[cls_size]>>{"
		           + this.target._out() + ";"
		           + "h="  + cls_size_enum.to_string(super.height.get()) + ";"
		           + "w="  + cls_size_enum.to_string(super.width.get())  + "}";
		return s_out;
		}
	}

	get target() { return this.#o_target; }
	set target(_s_id = "") {

		var b_changed = this.#o_target.id.set(_s_id);
		if (b_changed == false)
			return b_changed;
		else {
			return b_changed = this.#o_target.update();
		}
	}

	update () {
		var b_updated =  this.#o_target.is_valid();
		if (b_updated == false)
			b_updated =  this.#o_target.update();
		if (b_updated == false)
			return b_updated;
		if (false) {
			var rect  = this.target.get().getBoundingClientRect();
			if (b_updated) b_updated = super.height.set(rect.height, false);
			if (b_updated) b_updated = super.width.set (rect.width , false);

			return b_updated;
		}
		else {
			var style =  this.#o_target.get().style;
			if (style == null || style.length == 0) {
				return b_updated = false; // no style - no update; the previous values are still in use;
			}
			if (b_updated) b_updated = super.height.set(style.height, false);
			if (b_updated) b_updated = super.width.set (style.width , false);
		
			return b_updated;
		}
	}

	get_data_from(_o_el) { // gets size data from input html element;
		var b_result = cls_target.is_valid(_o_el);
		if (b_result == false)
			return b_result;

		super.height.set(_o_el.style.height, false);
		super.width .set(_o_el.style.width , false);

		return b_result;
	}
}

/////////////////////////////////////////////////////////////////////////////
// cls_cache, cls_target, cls_Id - these are classes related to html element wrapping;
/////////////////////////////////////////////////////////////////////////////

// this is html element target cache for managing a reference to the required object; 
class cls_cache {
	#o_tag_id = new cls_Id("invalid");                        // the default ID for creating unknown element cannot have any value, often an object is created;
	#o_target = document.createElement(this.#o_tag_id.get()); // https://developer.mozilla.org/en-US/docs/Web/API/HTMLUnknownElement ;

	constructor (_s_id = "") { this.#o_tag_id.set(_s_id); }
	// looks like a copy operator;
	assign (_rhs) {
		if (_rhs = null || !(_rhs instanceof cls_cache)) {
			if (__dbg_is_on) console.log("cls::[cls_cache].assign(): wrong parameter type;");
			return false;
		}
		var b_valid = _rhs.is_valid;
		if (b_valid) {
			b_valid = this.#o_tag_id.assign(_rhs.#o_tag_id);
			this.#o_target = _rhs.get();
		}
		return b_valid;
	}

	is_valid () {
		return ( this.#o_tag_id.is_valid && cls_target.is_valid(this.#o_target)); // this method references static method of cs_target class;
	}

	get id() {
		return this.#o_tag_id;
	}

	get () { return this.#o_target; }
	set (_s_id = "") {
		
		if (false == cls_Id.is_value(_s_id))
			return false; // input parameter has invalid value;
		else if (this.#o_tag_id.is_equal(_s_id))
			return false; // there is nothig to update: the identifier of the element remains the same;
		else {
			this.#o_tag_id.set(_s_id);
			return this.update();
		}
	}

	update () {
		var b_updated = this.#o_tag_id.is_valid;
		if (b_updated == false) {
			if (__dbg_is_on) console.log("[#warn] cls_cache.update() >> id is not updated: " + this.#o_tag_id.get());
			return b_updated;
		}
		this.#o_target = document.getElementById(this.#o_tag_id.get());

		b_updated = cls_target.is_valid(this.#o_target); // just checks what has been created by the call above;
		return b_updated; 
	}
}

// https://stackoverflow.com/questions/7753560/getting-an-elements-id-attribute >> how to get an identifier from element attributes, works as expected;
// https://www.w3schools.com/jsref/prop_html_id.asp >> some superficial understanding of how to deal with an identifier;

// this class is a wrapper of html element identifier; 
class cls_Id {
	#s_id = "";
	constructor(_s_id = "") { this.set(_s_id); } // no trim is applied and input argument value is used as it's set;

	assign (_rhs) {
		if (_rhs == null || !(_rhs instanceof cls_Id)) {
			if (__dbg_is_on) console.log("cls::[cls_Id].assign(): wrong parameter type;");
			return false;
		}
		this.#s_id = _rhs.get();
		return true;
	}

	get () { return this.#s_id; }
	set (_s_id = "") {
		var b_is_set = cls_Id.is_value(_s_id);
		if (b_is_set == false)
			return b_is_set;
		if (this.is_equal(_s_id))
			return b_is_set = false;

		this.#s_id = _s_id; return b_is_set = true;
	}
	// https://www.w3schools.com/js/js_typeof.asp ; https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof ;
	static is_value(_s_val = "" ) {
		const b_valid = !( null == _s_val || typeof _s_val !=='string' || 0 == _s_val.length );
		if ( !b_valid && __dbg_is_on && false) {

			var s_val = _s_val;
			if (s_val == null) s_val = "#null";
			if (s_val.length == 0) s_val = "#empty";

			console.log("cls::[cls_Id].is_value(" + s_val + ") >> invalid;");
		}
		return b_valid;
	}

	is_equal(_s_id = "") { // this property returns true in case when the current value is set and input argument is valid;
			var b_equal = (cls_Id.is_value(_s_id) && this.is_valid && this.get() === _s_id);
			return b_equal;
		}
	get is_valid() { return cls_Id.is_value(this.#s_id); }
	
	_out() {
		if (__dbg_is_on) {
			var s_out  = "cls::[cls_Id]>>{valid=" + this.is_valid + "; value=" + this.get() + "}";
			return s_out;
		}
	}

	static create_from(_o_id) { return (new cls_Id()).assign(_o_id); }
	static get (_o_el) {
		if (null == _e_ol || !(_o_el instanceof HTMLElement)) { // ToDo: HTMLUnknownElement interface must be taken into account;
			return "";
		}
		else
			return _o_el.getAttribute("id"); // https://stackoverflow.com/questions/7753560/getting-an-elements-id-attribute ;
	}
}

// this class is wrapper of html element for getting/setting its attributes or properties;
class cls_target extends cls_cache {

	constructor(_s_id = "") { super(_s_id); }

	_out() {
		if (__dbg_is_on) {
		var s_out  = "cls::[cls_target]>>{"
		           + "id="    + super.id.get()   + ";"
		           + "valid=" + super.is_valid() + "}";
		return s_out;
		}
	}

	static is_valid (_o_el) { // just checks input arg for null value and for html element instance; unknown type of html element is taken into account;
		return (              // the presence of an unknown element confuses the definition of the result;
		    _o_el != null
		&& (_o_el instanceof HTMLElement)
		&&!(_o_el instanceof HTMLUnknownElement));
	}
}

// this class is just a shortcut for its parent one, i.e. cls_target class;
class cls_element extends cls_target {

	constructor(_s_id = "") { super(_s_id); }
	_out() {
		if (__dbg_is_on) {
			var s_out  = "cls::[cls_element]>>{"
				       + "id="    + super.id.get()
				       + "valid=" + super.is_valid + "}";
			return s_out;
		}
	}
}

/////////////////////////////////////////////////////////////////////////////
// cls_shape class is just for testing classes related to geometry and layout of html element;
/////////////////////////////////////////////////////////////////////////////

class cls_shape {

	#o_tag_id = new cls_Id(fn_00000c13_eeee_bbbb_6667_000000000002()); // this is identifier value for making test only;
	#o_target = new cls_target(this.#o_tag_id.get());
	#o_pos    = new cls_position();

	#o_size   = new cls_size(0, 0);
	
	constructor(){}

	get id() { return this.#o_tag_id; }
	get target() { return this.#o_target; }
	get position() { return this.#o_pos; }
	get size() { return this.#o_size; }

	_out() {
		if (__dbg_is_on) {
			var cs_out = "cls::[cls_shape]>>{"
			           + "\n\t" + this.id._out()
			           + "\n\t" + this.target._out()
			           + "\n\t" + this.position._out()
			           + "\n}";
			return cs_out;
		}
	}
}

/////////////////////////////////////////////////////////////////////////////
// cls_style class is auxiliary wrapper surround an html element style properties;
/////////////////////////////////////////////////////////////////////////////

class cls_style {

	constructor () {}

	static _out(_o_el) {

		const is_valid = cs_target.is_valid(_o_el);
		if ( !is_valid ) {
			if (__dbg_is_on) {
				console.log("cls::[cls_style]._out()>>element is not valid;");
			}
			return "#error";
		}
		// https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration ;
		const p_style = _o_el.style;
		return p_style.cssText;
	}
}