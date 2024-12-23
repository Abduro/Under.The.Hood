using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

using Microsoft.Owin;
using Owin;

using el_veh.web;

[assembly: OwinStartupAttribute(typeof(MvcApplication))]


public class MvcApplication : System.Web.HttpApplication
{
    public void Configuration(IAppBuilder app) {} // this is required for the init of Owin::package, otherwise the error is thrown on web app startup;

    protected void Application_Start()
	{
		AreaRegistration.RegisterAllAreas();
		FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
		RouteConfig.RegisterRoutes(RouteTable.Routes);
		BundleConfig.RegisterBundles(BundleTable.Bundles);
	}
}
