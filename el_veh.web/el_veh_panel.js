/*
	Created by Tech_dog (ebontrop@gmail.com) on 14-Dec-2024 at 11:21:59.512, UTC+7, Novosibirsk, Monday
	This is electric vehicle ASP web project main page panel component JS implementation file;
*/

// https://stackoverflow.com/questions/14972587/accessing-parent-window-elements-from-iframe/14972741 ;
// https://stackoverflow.com/questions/195951/how-can-i-change-an-elements-class-with-javascript ;
const cls_a = ["tab-size-act", "tab-border-act", "tr-sel-act"];
const cls_d = ["tab-size-not", "tab-border-not", "tr-sel-not"];
// https://stackoverflow.com/questions/893144/equivalent-in-javascript :: something like this: @Url.Content("~/{path}) ;
function fn_go_home() {
	var content = parent.document.getElementById("content-frame");
	if (content)
		content.src="el_veh_home.html"//;
			
	var tr_0  = this.document.getElementById("tab_0");
	if (tr_0) {
		for (i_ = 0; i_ < cls_a.length; i_++) { tr_0.classList.add(cls_a[i_]); }
		for (i_ = 0; i_ < cls_d.length; i_++) { tr_0.classList.remove(cls_d[i_]); }
	}
		
	var tr_1  = this.document.getElementById("tab_1");
	if (tr_1) {
		for (i_ = 0; i_ < cls_d.length; i_++) { tr_1.classList.add(cls_d[i_]); }
		for (i_ = 0; i_ < cls_a.length; i_++) { tr_1.classList.remove(cls_a[i_]); }
	}
}

function fn_talk_about() {
	var content = parent.document.getElementById("content-frame");
	if (content)
		content.src="el_veh_about.html"//;

	var tr_0  = this.document.getElementById("tab_1");
	if (tr_0) {
		for (i_ = 0; i_ < cls_a.length; i_++) { tr_0.classList.add(cls_a[i_]); }
		for (i_ = 0; i_ < cls_d.length; i_++) { tr_0.classList.remove(cls_d[i_]); }
	}
			
	var tr_1  = this.document.getElementById("tab_0");
	if (tr_1) {
		for (i_ = 0; i_ < cls_d.length; i_++) { tr_1.classList.add(cls_d[i_]); }
		for (i_ = 0; i_ < cls_a.length; i_++) { tr_1.classList.remove(cls_a[i_]); }
	}
}

function fn_set_rest() {
	var req_heigh = this.innerHeight;
	req_heigh -= 334;
//	console.log('fn_set_rest(): height=' + req_heigh + 'px');
	var the_rest = document.getElementById("the-rest");
	if (the_rest) {
		the_rest.style.width = req_heigh + 'px';
//		the_rest.width = req_heigh;
		var content = the_rest.innerHTML;
		the_rest.innerHTML = content;
	}
	else
		console.log('fn_set_rest(): #not_ready;');
}

window.addEventListener("resize",fn_set_rest);
window.addEventListener("load"  ,fn_set_rest); // https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event ;
