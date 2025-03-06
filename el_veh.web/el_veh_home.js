/*
	Created by Tech_dog (ebontrop@gmail.com) on 14-Dec-2024 at 16:11:49.329, UTC+7, Novosibirsk, Monday
	This is electric vehicle ASP web project the main view JS implementation file;
*/

// https://stackoverflow.com/questions/8454510/open-url-in-same-window-and-in-same-tab ;
// https://stackoverflow.com/questions/4907843/open-a-url-in-a-new-tab-and-not-a-new-window ;

function fn_open_ref(href) {
	Object.assign(document.createElement('a'), {
		target: '_blank',
		rel: 'noopener noreferrer',
		href: href }).click();
	}
// https://stackoverflow.com/questions/44447847/enums-in-javascript-with-es6 ;
class eTopics {
	static get Scale() { return 1; }
	static get Parts() { return 2; }
	static get Gym()   { return 3; }
}

function fn_open_props (_topic = 0) {
	var s_cap = "#n/a";
	switch(_topic){
		case eTopics.Scale: s_cap = "Scale Pictogram"  ; break;
		case eTopics.Parts: s_cap = "Parts Pictogram"  ; break;
		case eTopics.Gym  : s_cap = "The Gym Pictogram"; break;
		default:;
	}

	//#region __test_modal_components

	var _0_ = parent.refs.shape;
	if (_0_) {
		var s_id = "modal-frame";
		if (false) {
			console.log("(0-a) " + _0_.id._out());      _0_.id.set(s_id);
			console.log("(0-b) " + _0_.id._out());
			console.log("(0-c) " + _0_.target._out());  _0_.target.set(_0_.id.get());
			console.log("(0-d) " + _0_.target._out());

			var pos_ = _0_.position;
			console.log("(0-e) " + pos_._out()); pos_.set(10, 20, 30, 40);
			console.log("(0-f) " + pos_._out());

			console.log("(0-g) " + _0_._out()); pos_.target.set(_0_.id.get());

			var size_ = _0_.size; size_.set(33,33);
					size_.target = s_id;
					size_.update();
					console.log("(0-h) " + size_._out());
			}
		}
		else
			alert("_0_:" + _0_);

	var _1_ = parent.refs.shade;
	if (_1_) {
		if (false)  {
			console.log("(1-a) " + _1_._out()); // not necessary to print out default values of the shade object;
			_1_.set(/*clr*/0xaba000, /*opacity*/5);
			console.log("(1-b) " + _1_._out());
		}
	}
	else
		alert("_1_:" + _1_);

	var _2_ = parent.refs.dialog;
	if (_2_) {
		if (false)
			console.log("(2) :" + _2_._out());
	}
	else
		alert("_2_:" + _2_);
//#endregion
			
	var props = parent.refs.dialog; {
		props.shade.set(/*clr*/0xaba000, /*opacity*/5);
	}
			
	props.caption(s_cap);
	props.size(600, 270);
			
	if (true) console.log("(3) before:" + props.frame.header.position._out());
	if (true) console.log("(4) before:" + props.content.position._out());

//	https://stackoverflow.com/questions/11796093/is-there-a-way-to-provide-named-parameters-in-a-function-call-in-javascript >> :D ;
//	props.layout.position.size.set(/*_width:*/600, /*_height:*/270);
	props.show();
	if (true) {
		console.log("(5) " + props.shade._out());                    // prints shade object properties after the dialog is shown;
		console.log("(6) " + props.frame.header.position._out());    // what is about header size;
		console.log("(7) " + props.frame.position._out());           // for checking how positions of layout and frame coincident with each other;
	}
	var evt_mouse = parent.evt_mouse;
	evt_mouse.handle();
			
	if (_2_ && false) {
		_2_.layout.center();

		console.log("(8) " + _2_.layout._out());
	}
	if (true) console.log("(6) " + props.frame.header.position._out());
}

function fn_show_themes () {

//	var themes = new cls_selector();
	var themes = parent.refs.themes;
	if (themes.shown)
		themes.hide()
	else
		themes.show();

}
