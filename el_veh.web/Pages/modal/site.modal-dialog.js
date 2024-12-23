/*
	Created by Tech_dog (ebontrop@gmail.com) on 26-Jan-2017 at 0:51:03a, UTC+7, Phuket, Rawai, Thursday;
	This is n.q.b.p sea stats project 'modal dialog' java script file.
	-----------------------------------------------------------------------------
	Adopted to electric vehicle project on 7-Dec-2024 at 21:38:53.034, UTC+7, Novosibirsk, Saturday;
*/

// https://www.w3schools.com/jsref/dom_obj_dialog.asp ;
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal ;
// https://developer.mozilla.org/en-US/docs/Web/CSS/:modal ;
// https://stackoverflow.com/questions/76563920/showmodal-in-javascript-not-working-when-inside-an-if-statement-in-a-function ;

function fn_00000c13_eeee_bbbb_6667_000000000005 (_is_dbg = true) {
	return'{00000C13-EEEE-BBBB-6667-000000000005}' ;
}

var __dbg_is_on = true;

class cls_ids {
	static get caption () { return "title-text"; }    // this div contains a text of the caption; 
	static get content () { return "modal-content"; }
	static get frame   () { return "modal-frame"; }
	static get title   () { return "modal-title"; }   // the div element identifier; this div contains: title text and icon image;
}

class cls_targets {
	static caption(){ return document.getElementById(cls_ids.caption); }  // used by header caption class; {cls_caption}
	static content(){ return document.getElementById(cls_ids.content); }  // used by content class;
	static frame  (){ return document.getElementById(cls_ids.frame); }    // used by frame, layout classes;
	static title  (){ return document.getElementById(cls_ids.title); }    // used by header class;
	// important: all shapes require setting target identifier directly due to they are not a part of dialog components' hierachy;
}

//#region __dlg_header ;
class cls_caption {
	#s_value = "#not_set";

	constructor(_text = "") { this.set(_text); }

	get () { return this.#s_value; }
	set (_text) {                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Text_formatting ;
		this.#s_value = _text;   // console.log("[dbg] dialog::caption.set(" + _text + ")");
		
		if (this.#s_value.length === 0)
			this.#s_value = "#not_set";

		var caption = cls_targets.caption();
		if (caption) {
			caption.innerHTML = this.get();
		}
	}

	_out() {
		if (__dbg_is_on) {
			var s_out = "cls::[cls_caption]>>{value=" + this.get() + "}";
			return s_out;
		}
	}
}

class cls_header {
	#o_cap = new cls_caption();
	#o_pos = new cls_pos_smp();

	constructor() { this.position.target = cls_ids.title; this.#defaults(); } // sets target identifier of header div element;

	get caption () { return this.#o_cap; }
	get position() { return this.#o_pos; }

	_out() {
		if (__dbg_is_on) {
			var s_out = "cls::[cls_header]>>{" + this.caption._out() + this.position._out() + "}";
			return s_out;
		}
	}
	//  this is a default size(s) of the header components, many of them are set from css code, thus, it must be the same (desirable);
	#defaults () {
		this.position.size.height.set(32);  // in pixels;
		this.position.size.width.set(cls_size_enum.Auto); // ToDo: it doesn't work because negative value is not applicable; must be reviewed;
	}
}
//#endregion ;

class cls_frame {
	#o_head = new cls_header();
	#o_pos  = new cls_pos_smp();

	#o_rect = new cls_rect_dat();

	constructor() { this.position.target = cls_ids.frame;  this.#defaults(); }

	get header () { return this.#o_head; }
	get position () { return this.#o_pos; }

	_out() {
		if (__dbg_is_on) {
			var s_out = "cls::[cls_frame]>>{" + this.header._out() + this.position._out() + "}";
			return s_out;
		}
	}
	
	get_client_rect () {

		var n_top = this.header.position.size.height.get();
		var n_bottom = this.position.size.height.get() - n_top;

		this.#o_rect.set(0, n_top, this.position.size.width.get() - 10, n_bottom); // ToDo: border thickness must be taken into account;

		return this.#o_rect;
	}

	#defaults () { // does not have any affect yet, in other words, not working;
		this.position.size.height.set(0);
		this.position.size.width.set (0);
	}
}

class cls_content {
	#o_pos  = new cls_pos_smp();

	constructor () { this.position.target.set(cls_ids.content); }

	get position () { return this.#o_pos; }

	_out() {
		if (__dbg_is_on) {
			var s_out = "cls::[cls_content]>>{" + this.position._out() + "}";
			return s_out;
		}
	}
}

class cls_layout {

	#o_comps = null ;// new cls_components(); 

	constructor (_p_comps) {
		if (_p_comps instanceof cls_components)
			this.#o_comps = _p_comps;
		else
			this.#o_comps = new cls_components(); 
	}

	center () { // centers the dialog panel/frame relative to the currently available client area of the main browser window;

		if (this.#o_comps == null || !this.#o_comps instanceof cls_components)
			return;

		var frame = this.#o_comps.frame;

		var n_left = (window.innerWidth  - frame.position.size.width.get() ) / 2; // alert("[w]=" + frame.position.size.width.get() );
		var n_top  = (window.innerHeight - frame.position.size.height.get()) / 2; // alert("[h]=" + frame.position.size.height.get() );

		frame.position.left = n_left; // alert(n_left);
		frame.position.top  = n_top ; // alert(n_top );
	}

	recalc () {
		var b_is_done = (null != this.#o_comps);
		if (b_is_done == false)
			return b_is_done;
		
		var rect = this.#o_comps.frame.get_client_rect();

		this.#o_comps.content.position.set_rect(rect);
		this.#o_comps.content.position.update(true);

		return b_is_done;
	}

	_out() {
		if (__dbg_is_on) {
			var s_out = "cls::[cls_layout]>>{"  +  "}";
			return s_out;
		}
	}
}

class cls_components {
	#o_frame   = new cls_frame  ();   // dialog frame, that contains header object inside;
	#o_content = new cls_content(); // dialog content component for displaying context information;

	constructor(){}

	get frame  () { return this.#o_frame  ; }
	get content() { return this.#o_content; }
}

class cls_dialog {
	// attribute(s)
	#o_comps   = new cls_components();
	#o_layout  = new cls_layout(this.#o_comps);
	#o_shade   = new cls_shade();

	constructor() { /*this.layout.position = this.frame.position;*/ }
	// accessor(s);
	get content() { return this.#o_comps.content; }
	get frame  () { return this.#o_comps.frame  ; }
	get layout () { return this.#o_layout ; }
	get shade  () { return this.#o_shade  ; }
	// print out;
	_out() {
		if (__dbg_is_on) {
			var s_out = "cls::[cls_dialog]>>{" + /*this.frame._out() + this.content._out() +*/ this.layout._out() + "}";
			return s_out;
		}
	}
	// shortcut(s);
	caption(_text) { this.frame.header.caption.set(_text); }
	// sets the size of dialog frame;
	size (_w = 100, _h = 50 ) { // the default values of optional args are just making data type definite;
		this.frame.position.size.set(_w, _h);
	//	this.frame.position.update();
	}

	// show & hide control;
	hide () {
		var frame = cls_targets.frame();
		if (frame) {
			frame.style.display = "none";
		}
		this.shade.hide();
	}

	show () {
		this.shade.show();

		var frame = cls_targets.frame();
		if (frame) {
			this.layout.center();
			this.layout.recalc();
			this.frame.position.update(true);
		}
	}
}

class cls_dummy {
	#el_themes = document.getElementById("sel_themes");
	constructor() {}

	get() { alert(this.#el_themes); return this.#el_themes; }
}
