<%@ Page Title="Battery On Wheels" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" Theme="Dark" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">

	<!-- https://learn.microsoft.com/en-us/previous-versions/aspnet/0yy5hxdk(v=vs.100) -->
	<!-- https://learn.microsoft.com/en-us/previous-versions/aspnet/tx35bd89(v=vs.100) -->

	<link  type="text/css" rel="stylesheet" href="Default.css"  runat="server" media="screen" /><!--'Theme' attribute above also works;-->

	<!-- it is important to provide relative path as is, no asp.net keywords must be applied; -->
	<link type="text/css" rel="stylesheet" href="./pages/modal/site.modal-dialog.css" runat="server" media="screen"/>

	<script type="text/javascript" src="./scripts/draw/site.draw-shape.js"></script>

	<script type="text/javascript" src="./pages/modal/site.modal-mouse.js"></script>
	<script type="text/javascript" src="./pages/modal/site.modal-shade.js"></script>
	<script type="text/javascript" src="./pages/modal/site.modal-dialog.js"></script>

	<script type="text/javascript" src="./pages/modal/site.popup-select.js"></script>

	<style>
		:root { --shade-id : "shade-layer" ; } /* https://stackoverflow.com/questions/41725725/access-css-variable-from-javascript ; */
	</style>

	<script>
		// https://stackoverflow.com/questions/3369593/how-to-detect-escape-key-press ; works as expected ;
		document.addEventListener("keyup", (event) => {
				if (event.key === 'Escape' ) {
					console.log("[dbg] event::handler{} >> keypress(): escape key is pressed;");
					const _b_no_combo = !(event.ctrlKey || event.altKey || event.shiftKey);
					if (true === _b_no_combo) {
						refs.dialog.hide();
						refs.themes.hide();
					}
				}
			}
		);
	</script>

	<script>
		/* // https://stackoverflow.com/questions/3999101/get-iframes-document-from-javascript-in-main-document ;
			var shape = function() {
				var frame = document.getElementById("frame-hidden");
				if (frame) {
					this.o_shape = frame.contentWindow.shape; // contentDocument does not contain script object;
				}
				return this.o_shape;
			}
		*/
		/*document.title="fn_00000c13_eeee_bbbb_6667_000000000007";*/

		class cls_page_layout {
			#o_client_rect = new cls_rect_dat();

			constructor () {}
			get () {
				return this.#o_client_rect;
			}
			set() { // https://stackoverflow.com/questions/5484578/how-to-get-document-height-and-width-without-using-jquery ;
				var b_result = this.#o_client_rect.set(0, 0, window.innerWidth, window.innerHeight);
				return b_result;
			}
			updated() {
				this.set();
				return this.get();
			}
		}
	</script>

	<script>
		var refs = (function _get_refs(){

			var dialog = new cls_dialog();
			var shade  = new cls_shade ();
			var shape  = new cls_shape ();

			var themes = new cls_selector(document.body);
			var layout = new cls_page_layout();

			return { dialog, shade, shape, themes, layout};
		})();
	</script>

	<!-- https://stackoverflow.com/questions/6754275/set-keyboard-focus-to-a-div ; otherwise, there is no focus on this element; -->
	<div id="shade-layer" class="shade-overlay" tabindex="-1"></div>

	<div id="panel">
		<iframe id="panel-frame" src="el_veh_panel.html"></iframe>
	</div>

	<div id="content">
		<!--the first tab on the left panel is also selected by default, and this coincides with the display of the first page below;-->
		<iframe id="content-frame" src="el_veh_cars.aspx"></iframe>
	</div>

	<div id="modal-frame" class="modal-frame modal-borders">
		<img src="~/images/modal/frame-close-button-1.png" title="Close" class="x-close" onclick="javascript: refs.dialog.hide();" />

		<div id="modal-title" class="modal-title">
			<div class="title-text" id="title-text"> #This Is The Title </div>
			<div class="title-borders"/>
		</div>

		<div id="modal-content" style="top:0px;height:100%;width:100%;">
			<iframe id="frame-content" class="modal-content" src="~/pages/modal/site.event-wait.html"></iframe>
		</div>

		<iframe id="frame-hidden" style="display:none;" src="~/pages/modal/site.modal-dialog.html" />
	</div>

	<div>
			<iframe id="footer" src="el_veh_foot.html"></iframe> <!--ToDo: div-element must be used as it's made above for other iframes;-->
	</div>
</asp:Content>
