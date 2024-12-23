/*
	Created by Tech_dog (ebontrop@gmail.com) on 21-Dec-2024 at 09:12:32.584, UTC+3, Batumi, Saturday;
	This is Electric Vehicle project car image loader HTTP handler definition file;
*/
<%@ WebHandler Language="C#" Class="CCarImageHandler" %>

using System;
using System.Web;

using el_veh.asp;

// https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/how-to-convert-a-string-to-a-number ;
// https://learn.microsoft.com/en-us/troubleshoot/developer/webapps/aspnet/development/http-modules-handlers#create-http-handlers ;

public class CCarImageHandler : System.Web.IHttpHandler {

	public void ProcessRequest(HttpContext _ctx)
	{
		string s_car_id = _ctx.Request.QueryString["car_id"];

		if (null == s_car_id)
			return;

		int n_car_id = 0;
		try {
			n_car_id = Int32.Parse(s_car_id);
		}
		catch (FormatException) {
			return;
		}

		Byte[] raw_data = null;

		CCarImage car_image = new CCarImage();

		if (false==car_image.Get(n_car_id, ref raw_data))
			return;

		_ctx.Response.Buffer = true;
		_ctx.Response.Charset = "";
		_ctx.Response.Cache.SetCacheability(HttpCacheability.NoCache);
		_ctx.Response.ContentType = "image/png";
		_ctx.Response.BinaryWrite(raw_data);
		_ctx.Response.Flush();
		_ctx.Response.End();
	}

	public bool IsReusable {
		get {
			return false;
		}
	}

}