/*
	Created by Tech_dog (ebontrop@gmail.com) on 23-Dec-2024 at 05:14:24.059, UTC+4, Batumi, Monday;
	This is 'Battery On Wheel' web project modeless popup selector dialog javascript definitions' file;
*/

function fn_00000c13_eeee_bbbb_6667_000000000006 (_is_dbg = true) {
	return'{00000C13-EEEE-BBBB-6667-000000000006}' ;
}

var __dbg_is_on = true;

class cls_ids_pops {
	static get bkgnd  () { return "sel-bkgnd"; }
	static get content() { return "sel-cont" ; }
	static get frame  () { return "sel-frame"; }
	static get head   () { return "sel-head" ; }
	static get shape  () { return "sel-shape"; }
}

class cls_shortcut {
	#o_place = new cls_anchor();   // this is a placement of the shortcut on the background image;
	#o_size  = new cls_size_dat(); // this is a size of the shortcut; it looks like a using of the cls_pos_dat class would be more suitable, but for readability is not;

	constructor() { this.#defaut(); }

	get is_valid() {
		if (null == this.#o_place || !(this.#o_place instanceof cls_anchor)) {
			if (__dbg_is_on) { console("cls::[cls_shortcut].is_valid=false: invalid anchor object;"); } return false;
		}
		if (null == this.#o_size || !(this.#o_size instanceof cls_size_dat)) {
			if (__dbg_is_on) { console("cls::[cls_shortcut].is_valid=false: invalid size object;"); } return false;
		}
		return (true);
	}

	get is_zero() { return (false == this.is_valid || this.size.is_zero); }

	get place() { return this.#o_place; }
	get size () { return this.#o_size ; }

	_out (_s_in = "") {
		if (__dbg_is_on) {
			var cs_out = _s_in  + "cls::[cls_shortcut]>>{"
			           + "\n\t" + _s_in + this.place._out()
			           + "\n\t" + _s_in + this.size._out()
			           + "\n"   + _s_in + "}";
			return cs_out;
		}
	}

	#defaut () {
		this.size.set( 27,  43);   // theme selector shortcut size in px; for the image that is set by default: 'themes_dlg-d1.png';
	}
}

class cls_back_geometry {
	#o_size  = new cls_size_dat(); // the entire size of the background image;
	#o_short = new cls_shortcut(); // the geometry of the selector shape shortcut rectangle (some sort of connect tag or hand);

	constructor() { this.#default(); }

	calc (_o_anchor = new cls_anchor(0,0)) {
		var b_result = this.is_valid;
		if (b_result == false)
			return b_result;

		// firstly just trying to calculate where shape of the selector should be;
		return (b_result = true);
	}

	get is_valid() {
		if (null == this.#o_short || !(this.#o_short instanceof cls_shortcut)) {
			if (__dbg_is_on) { console.log("cls::[cls_back_geometry].is_valid=false: invalid shortcut object;"); } return false;
		}
		if (null == this.#o_size || !(this.#o_size instanceof cls_size_dat)) {
			if (__dbg_is_on) { console.log("cls::[cls_back_geometry].is_valid=false: invalid size object;"); } return false;
		}
		return (true);
	}

	get short () { return this.#o_short; }
	get size  () { return this.#o_size ; }

	_out (_s_in = "") {
		if (__dbg_is_on) {
			var cs_out = _s_in  + "cls::[cls_back_geometry]>>{"
			           + "\n\t" + _s_in + this.size._out()
			           + "\n\t" + _s_in + this.short._out(_s_in + _tabs.get(1))
			           + "\n"   + _s_in + "}";
			return cs_out;
		}
	}

	#default () {
		this.size.set(260, 276);   // current background image size is 240x266px + 10px of the shadow of the left|right|top sides; 'themes_dlg-d1.png';
	}
}

// this class is for shape background image; the node or element of this class is appended by its parent one, i.e. the container;
class cls_back {
	#e_back = document.createElement("img");
	#s_path = "";
	#o_id   = new cls_Id();

	constructor (_s_id = cls_ids_pops.bkgnd, _s_path = cls_back.#default()) {
		this.create(_s_id, _s_path);
	}

	create (_s_id = cls_ids_pops.bkgnd, _s_path = cls_back.#default()) {
		if (__dbg_is_on && false) {
			console.log("cls::[cls_back].create(): args<<{_s_id=" + _s_id + ";_s_path=" + _s_path + "}");
		}

		var b_created = this.is_valid;
		if (b_created == false) { // tries to create the element one more time;
			this.#e_back = document.createElement("img");
			if (!this.is_valid)
				return b_created;
		}

		if (cls_Id.is_value(_s_id)) {     // if it is not valid value for setting the element identifier, it is just ignored;
			this.#e_back.setAttribute("id", _s_id);
			this.#o_id.set(_s_id);        // the identifier object checks input argument again that is *not* necessery, it is okay for this draft version;
		}

		b_created = this.source(_s_path); // the input arg value is checked for validity by this method;
		
		return b_created;
	}

	get is_valid () {
		const b_valid = cls_target.is_valid(this.#e_back);
		if (__dbg_is_on && b_valid == false)
				console.log("cls::[cls_back].is_valid >> false;");
		return b_valid;
	}

	get id () { return this.#o_id; }        // gets the reference to background image identifier object; it is not intended for re-assigning the ID;
	get image() { return this.#e_back; }    // gets the reference to image html element;

	get source() { return this.#s_path; }   // just reterns the path that is currently set as this image source;
	source(_s_path) {                       // sets the path to the source of this image html object;

		var b_is_set = false;

		if (null == _s_path || 'string' !== typeof(_s_path)) {
			if (__dbg_is_on)
				console.log("cls::[cls_back].source() failed: input arg invalid;");
			return b_is_set;
		}
		// ToDo: this version of impl of this method supposes the element being affected is already created, perhaps there's better way;
		if (this.is_valid == false) {
			return b_is_set;
		}
		// ToDo: there is no checking for existence of such attribute; perhaps calling setAttribute() would be better; 
		const att_src = document.createAttribute("src");
		if (att_src) {
			att_src.value = _s_path;                // there's no check for validity of assigned value; that's okay for now;
			this.#e_back.setAttributeNode(att_src); // https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttributeNode ; the returned result is not important;
			this.#s_path  = _s_path;
			b_is_set = true;
		}

		return b_is_set;
	}

	static #default () {
		return "./images/modal/theme-menu-d1.png";
	}

	_out() {
		if (__dbg_is_on) {
			var s_out = "cls::[cls_back]>>{valid=" + this.is_valid + ";" + this.id._out() + "path=" + this.#s_path + "}";
			return s_out;
		}
	}
}

// this class is a container for outer html pages that may create or compose a content of the shape popup;
class cls_frame_pops {
	#e_frame = document.createElement("iframe");
	#o_id    = new cls_Id();
	#s_src   = "#not_set";

	constructor (_s_id = cls_ids_pops.frame) {
		this.#default();
		const b_created = this.create(_s_id);
		if ( !b_created ) {
			if (__dbg_is_on) {
				console.log("cls::[cls_frame_pops].#ctor>>object creation failed;");
			}
		}
	}

	create (_s_id = cls_ids_pops.frame) {
		if (__dbg_is_on && false) {
			console.log("cls::[cls_frame_pops].create(): args<<{_s_id=" + _s_id + "}");
		}
		var b_created = this.is_valid;
		if (b_created == false) { // tries to create the element one more time;
			this.#e_frame = document.createElement("iframe");
			if (!this.is_valid)
				return b_created;
		}

		if (cls_Id.is_value(_s_id)) { // if it is not valid value for setting the element identifier, it is just ignored;
			this.#e_frame.setAttribute("id", _s_id);
			this.#o_id.set(_s_id);
		}

		return b_created;
	}

	get is_valid () {
		const b_valid = cls_target.is_valid(this.#e_frame);
		if (__dbg_is_on && b_valid == false)
				console.log("cls::[cls_frame_pops].is_valid >> false;");
		return b_valid;
	}

	get id () { return this.#o_id; }
	get source () { return this.#s_src; }

	_out() {
		if (__dbg_is_on) {
			const  cs_out = "cls::[cls_frame_pops]>>{id=" + this.id.get() + ";valid=" + this.is_valid + ";src=" + this.#s_src + "}";
			return cs_out;
		}
	}

	#default () {
		// the iframe of the selector looks like may have theme selector content html page reference by default this time;
		this.#s_src = "./pages/modal/site.popup-select.html"; // just for this frame test;
	}
}

class cls_content_pops {
	#e_cont  = document.createElement("div");
	#o_pos   = new cls_pos_dat();
	#o_id    = new cls_Id();
	#o_frame = new cls_frame_pops();

	constructor (_s_id = cls_ids_pops.content) {
		this.#default();
		const b_created = this.create(_s_id);
		if ( !b_created ) {
			if (__dbg_is_on) {
				console.log("cls::[cls_content_pops].#ctor>>object creation failed;");
			}
		}
	}

	create (_s_id = cls_ids_pops.content) {
		if (__dbg_is_on && false) {
			console.log("cls::[cls_content_pops].create(): args<<{_s_id=" + _s_id + "}");
		}
		var b_created = this.is_valid;
		if (b_created == false) { // tries to create the element one more time;
			this.#e_cont = document.createElement("div");
			if (!this.is_valid)
				return b_created;
		}

		if (cls_Id.is_value(_s_id)) { // if it is not valid value for setting the element identifier, it is just ignored;
			this.#e_cont.setAttribute("id", _s_id);
			this.#o_id.set(_s_id);
		}

		return b_created;
	}

	get frame () { return this.#o_frame; }
	get is_valid () {
		const b_valid = cls_target.is_valid(this.#e_cont);
		if (__dbg_is_on && b_valid == false)
				console.log("cls::[cls_content_pops].is_valid >> false;");
		return b_valid;
	}

	get id () { return this.#o_id; }

	get position() { return this.#o_pos; }
	set position(_o_pos) {
		const b_result = this.#o_pos.assign(_o_pos);
		if (b_result == false && __dbg_is_on)
			console.log("cls::[cls_content_pops].position.set() >> failed;");
	}

	_out (_s_in = "") {
		if (__dbg_is_on) {
			const  cs_out = "cls::[cls_content_pops]>>{"
			       + "\n\t" + _s_in + this.id._out()
			       + "\n\t" + _s_in + this.position._out(_s_in + _tabs.get(1))
			       + "\n\t" + _s_in + this.frame._out()
			       + "\n"   + _s_in + "}";
			return cs_out;
		}
	}

	#default() {
		if (this.#o_pos) {
			this.#o_pos.anchor.set(0, 0);
			this.#o_pos.size.set(cls_size_enum.Auto, 185); // it is dependable on bkg image height and header height too; for this draft version;
		}
	}
}

class cls_head_pops {
	#e_head = document.createElement("div");
	#o_pos  = new cls_pos_dat();
	#o_cap  = new cls_caption();
	#o_id   = new cls_Id();

	constructor (_s_id = cls_ids_pops.head) {
		this.#default();
		const b_created = this.create(_s_id);
		if ( !b_created ) {
			if (__dbg_is_on) {
				console.log("cls::[cls_head_pops].#ctor>>header creation failed;");
			}
		}
	}

	create (_s_id = cls_ids_pops.head) {
		if (__dbg_is_on && false) {
			console.log("cls::[cls_head_pops].create(): args<<{_s_id=" + _s_id + "}");
		}
		var b_created = this.is_valid;
		if (b_created == false) { // tries to create the element one more time;
			this.#e_head = document.createElement("div");
			if (!this.is_valid)
				return b_created;
		}

		if (cls_Id.is_value(_s_id)) { // if it is not valid value for setting the element identifier, it is just ignored;
			this.#e_head.setAttribute("id", _s_id);
			this.#o_id.set(_s_id);
		}

		b_created = this.update();

		return b_created;
	}

	get () { return this.#e_head; }

	get is_valid () {
		const b_valid = cls_target.is_valid(this.#e_head);
		if (__dbg_is_on && b_valid == false)
				console.log("cls::[cls_head_pops].is_valid >> false;");
		return b_valid;
	}

	get caption () { return this.#o_cap; }
	get id () { return this.#o_id; }

	get position() { return this.#o_pos; }
	set position(_o_pos) {
		const b_result = this.#o_pos.assign(_o_pos);
		if (b_result == false && __dbg_is_on)
			console.log("cls::[cls_head_pops].position.set() >> failed;");
	}

	_out (_s_in = "") {
		if (__dbg_is_on) {
			const  cs_out = "cls::[cls_head_pops]>>{"
			       + "\n\t" + _s_in + this.id._out()
			       + "\n\t" + _s_in + this.caption._out()
			       + "\n\t" + _s_in + this.position._out(_s_in + _tabs.get(1))
			       + "\n"   + _s_in + "}";
			return cs_out;
		}
	}
	// applies the particular position and size to the header division element;
	update () {
		if (this.b_valid == false)
			return false;

		var n_width = 0;
		if (cls_size_enum.is_auto(this.position.size.w.get())) {
			const geo = new cls_back_geometry();
			n_width   = geo.size.w.get();
		} else {
			n_width   = this.position.size.w.get();
		}
		// position att is required: its value means the placement inside of parent element layout;
		const cs_style = "display:block; position:absolute;"
		               + "left:"   + this.position.anchor.x + "px;"
		               + "top :"   + this.position.anchor.y + "px;"
		               + "height:" + this.position.size.h.get() + "px;"
		               + "width :" + n_width + "px;";

		this.#e_head.style = cs_style;

		return (true);
	}

	#default() {
		if (this.#o_pos) {
			this.#o_pos.anchor.set(0, 0);
			this.#o_pos.size.set(cls_size_enum.Auto, 40);
		}
	}
}

class cls_shape_pops {
	#o_shape = document.createElement("div");
	#o_back  = new cls_back();         // creates background image;
	#o_head  = new cls_head_pops();    // the frame header object ;
	#o_cont  = new cls_content_pops(); // selector content object ;
	#o_id    = new cls_Id();

	constructor(_s_id = cls_ids_pops.shape) {
		const b_created = this.create(_s_id);
		if ( !b_created ) {
			if (__dbg_is_on) {
				console.log("cls::[cls_shape_pops].#ctor>>shape creation failed;");
			}
		}
	}

	create (_s_id = cls_ids_pops.shape) { // creating background image object and header's one occur automatically through their constructors;
		if (__dbg_is_on && false) {
			console.log("cls::[cls_shape_pops].create(): args<<{_s_id=" + _s_id + "}");
		}
		
		var b_result = cls_target.is_valid(this.#o_shape);
		if (b_result == false) {
			if (__dbg_is_on)
				console.log("cls::[cls_shape_pops].create(" + cls_ids_pops.shape + ") failed: element is not created;");
			
			this.#o_shape = document.createElement("div"); // tries again;
	 		b_result = cls_target.is_valid(this.#o_shape);
			if (!b_resut)
				return b_result;
		}
		var att_id = document.createAttribute("id");
		if (att_id) {
			att_id.value = cls_ids_pops.shape;      // does not check the attribute value that is being assigned;
			this.#o_shape.setAttributeNode(att_id);
			this.#o_id.set(cls_ids_pops.shape);     // the identifier object checks the input value internally, but it is not important for now;
		}
		// https://stackoverflow.com/questions/3660831/getting-rid-of-the-blue-focus-rectangle-on-input-boxes-in-html-css ;
		var style_req = "z-index:99; display:none; position:fixed; outline:none;";
		//  it is not applicable due to a background has rectangular borders regardless its visual representation (i.e. a transparancy of particular parts);
		//  style_req+= "box-shadow: 0 3px 15px #111;";
		//  the solution for this issue is setting a shadow directly to image itself in photoshop app;

		this.#o_shape.style = style_req; // it's necessary to take into account modal dialog shade layer z-index;
		this.#o_shape.tabIndex = -1;

		this.#o_shape.appendChild(this.#o_back.image); // real things gonna to start now;
		this.#o_shape.appendChild(this.#o_head.get());
		document.body.appendChild(this.#o_shape);

		return b_result;
	}

	get back () { return this.#o_back; }
	get head () { return this.#o_head; }
	get id () { return this.#o_id; }

	get content() { return this.#o_cont; }

	get is_valid () {
		const b_valid = cls_target.is_valid(this.#o_shape);
		if (__dbg_is_on && b_valid == false)
				console.log("cls::[cls_shape_pops].is_valid >> false;");
		return b_valid;
	}

	get() { return this.#o_shape; } // gets shape html division element;

	hide () {
		var b_result = this.is_valid;
		if (b_result == false)
			return b_result;

		this.#o_shape.style.display = "none";

		return b_result;
	}

	show (_x = 0, _y = 0) {

		var b_result = this.is_valid;
		if (b_result == false) {
			return b_result;
		}

		this.#o_shape.style.left    = _x + "px";
		this.#o_shape.style.top     = _y + "px";
		this.#o_shape.style.display =   "block";

	//	this.#o_shape.focus();

		if (__dbg_is_on) {
		//	console.clear();
			console.log("cls::[cls_shape_pops].show()>>style:" + this.#o_shape.style.cssText);
		}
		return b_result;
	}

	_out (_s_in = "") {
		if (__dbg_is_on) {
			var cs_out = _s_in  + "cls::[cls_shape_pops]>>{"
			           + "\n\t" + _s_in + this.back._out()
			           + "\n\t" + _s_in + this.head._out(_s_in + _tabs.get(1))
					   + "\n\t" + _s_in + this.content._out(_s_in + _tabs.get(1))
					   + "\n\t" + _s_in + this.id._out()
			           + "\n"   + _s_in + "}";
			return cs_out;
		}
	}
}

/*
 * ToDo: it is necessary to exclude a predefined background image as base element of the selector shape;
*/
class cls_selector {

	#o_shape  = new cls_shape_pops();
	#o_parent = null;
	#b_shown  = false;

	constructor (_o_parent) {
		this.#o_parent = _o_parent;
		if (__dbg_is_on) {
			if (null == _o_parent)
				console.log("cls::[cls_selector].#ctor()>>invalid parent element;");
			else {
				if (this.#o_shape) {
					var el_shape = this.#o_shape.get();
					if (el_shape) {
						_o_parent.appendChild(el_shape);
					}
				}
				console.log("cls::[cls_selector].#ctor()>>parent=" + _o_parent);
			}
		}
	}

	_out (_s_in = "") {
		if (__dbg_is_on) {
			var s_out = "cls::[cls_selector]>>{\n" + this.shape._out(_s_in + _tabs.get(1)) + "}";
			return s_out;
		}
	}

	get is_valid() { return null != this.#o_shape && cls_target.is_valid(this.#o_shape.get()); }

	hide () {
		var b_result = this.is_valid;
		if (b_result) {
			b_result = this.#o_shape.hide();

			this.#b_shown = false; // doesn't matter the result that is gotten above, it is just ignored;
		}
		return b_result;
	}

	show (_x = 0, _y = 0) {
		var b_result = this.is_valid;
		if (b_result) {
			b_result = this.#o_shape.show(_x, _y);
			this.#b_shown = b_result; // it is important to match the visibility flag with actual result of setting required style options;
		}
		return b_result;
	}

	get shown() { return this.#b_shown; } // looks like 'is_shown' property name would be better;

	get shape() { return this.#o_shape; }
}