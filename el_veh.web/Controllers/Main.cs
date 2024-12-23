using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace el_veh.web.Controllers
{
    public class MainController : Controller
    {
		public ActionResult Frame()
		{
			ViewBag.Message = "#n/a";
			return View();
		}
	}
}