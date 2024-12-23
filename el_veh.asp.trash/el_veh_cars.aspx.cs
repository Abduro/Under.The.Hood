/*
	Created by Tech_dog (ebontrop@gmail.com) on 19-Dec-2024 at 00:33:59.659, UTC+7, Novosibirsk, Thursday;
	This is Electric Vehicle test project cars' list main page behind code implementation file;
*/
using System;
using System.Web.UI;

namespace el_veh.asp {
	// https://stackoverflow.com/questions/14661204/events-and-virtual-methods-in-system-web-ui-page-class ;
	public partial class CCars :  System.Web.UI.Page  {

		public CCars() {
		}
		protected void Page_Init(object _sender, EventArgs _args) {}
		protected void Page_Load(object _sender, EventArgs _args) {}

		// event handlers; these events are fired by Load and Init methods of the base class implementation;
		protected override void OnInit(EventArgs _args) { base.OnInit(_args); }
		protected override void OnLoad(EventArgs _args) { base.OnInit(_args); }

	}
}