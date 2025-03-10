/*
	Created by Tech_dog (ebontrop@gmail.com) on 19-Dec-2024 at 00:33:59.659, UTC+4, Batumi, Thursday;
	This is Electric Vehicle test project cars' list main page behind code implementation file;
*/
using System;

//namespace el_veh.asp {
	// https://stackoverflow.com/questions/14661204/events-and-virtual-methods-in-system-web-ui-page-class ;
	public partial class CCars :  System.Web.UI.Page  {

		public CCars() {
		}
	//	protected void Page_Init(object _sender, EventArgs _args) { }
		protected void Page_Load(object _sender, EventArgs _args) { base.DataBind(); }

		// event handlers; these events are fired by Load and Init methods of the base class implementation;
		protected override void OnInit(EventArgs _args) { base.OnInit(_args); }
		protected override void OnLoad(EventArgs _args) { base.OnInit(_args); }

		protected string GetBindString(string _car_id)
		{
			return "~/Handlers/car.image.handler.ashx?car_id=" + _car_id; // sends the request with specific car identifier to CCarImageHandler();
		}
	}
//}