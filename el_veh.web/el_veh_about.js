/*
	Created by Tech_dog (ebontrop@gmail.com) on 17-Dec-2024 at 16:56:52.098, UTC+7, Novosibirsk, Tuesday
	This is electric vehicle ASP web project 'About' page JS implementation file;
*/

function fn_go_to_home() {
	var url_ = "inter::1131";
	window.location = url_;
}

function fn_go_to_origin() {
	var url_ = "http://www.habousha.be/archive_images_2005/HD/new_011.jpg";
	window.location = url_;
}

function fn_go_to_habousha() {
	var url_ = "https://www.productionparadise.com/member/brussels/studio-habousha.html"; // looks like this site is inaccessible at least very often;
	window.location = url_;
}

function fn_get_cnt_width() {
	var v_result = window.innerWidth()  - 200;
	document.getElementById("#id_table").innerWidth() = v_result;
	return v_result;
}
