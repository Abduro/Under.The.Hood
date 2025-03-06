/*
	Created by Tech_dog (ebontrop@gmail.com) on 16-Dec-2024 at 14:23:08.68, UTC+7, Batumi, Monday
	This is electric vehicle ASP web project main page footer/statusbar component JS implementation file;
*/

function fn_show_themes() {
			
	var pos_pane = new cls_position(); pos_pane.set_from(document.getElementById("pane-#2"));
	var rec_foot = parent.refs.layout.updated();
	if (__dbg_is_on) {
		console.log(rec_foot._out());
	}

	var themes = parent.refs.themes;
	if (themes.shown)
		themes.hide()
	else {
        	const sz_short = new cls_size_dat( 27,  43); // theme selector shortcut size in px;
		const sz_shape = new cls_size_dat(260, 276); // current background image size is 240x266px + 10px of the shadow of the left|right|top sides;

		themes.show(pos_pane.left - (sz_shape.w.get() - sz_short.w.get()) / 2, rec_foot.bottom.get() - sz_shape.h.get());
		themes.shape.get().focus();                  // the focus can be set through cls_shape_pops::show() method automatically, but it is set by the caller;
	}
	if (__dbg_is_on) {
		console.clear();
		console.log(themes._out());
	}
}

