using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace el_veh.web.Controllers
{
	public class HomeController : Controller
	{
		public ActionResult Index()
		{
			return View();
		}

		public ActionResult About()
		{
			ViewBag.Message = "#desc_page_not_set";

			return View();
		}

		public ActionResult Contact()
		{
			ViewBag.Message = "#cont_page_not_set";

			return View();
		}
	}
}