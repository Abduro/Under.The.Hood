using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(el_veh.asp.Startup))]
namespace el_veh.asp
{
    public partial class Startup {
        public void Configuration(IAppBuilder app) {
            ConfigureAuth(app);
        }
    }
}
