<!--
	Created by Tech_dog (ebontrop@gmail.com) on 17-Dec-2024 at 23:10:50.066, UTC+4, Batumi, Wednesday;
	This is Electric Vehicle test project cars list main page definition file;
  -->
<%@ Page Language="C#" AutoEventWireup="true" CodeFile="el_veh_cars.aspx.cs" Inherits="CCars" ClientIDMode="Static" %>

<%@ Register Assembly="obout_Grid_NET" Namespace="Obout.Grid" TagPrefix="obout" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">

<head runat="server">
	<title></title>

	<meta http-equiv="Content-Type" content="text/html; charset=windows-1252"/>

	<link   type="text/css" rel="stylesheet" href="el_veh_cars.css"         runat="server" media="screen"/>
	<link   type="text/css" rel="stylesheet" href="el_veh_shared.css"       runat="server" media="screen"/>
	<link   type="text/css" rel="stylesheet" href="content/site.el-veh.css" runat="server" media="screen"/>
	
	<script type="text/javascript" src="el_veh_cars.js"></script>

</head>

<body class="cls-this-bod-clr cls-this-bod-pos cls-this-bod-txt">

<div  class="cls-div-main">
	<table class="cls-table-cap">
		<tr>
			<td><img src="./Images/Home/epsilon_logo_056px.png" /></td>
			<td class="cls-table-cap-td">
				Battery on Wheels
			</td>
		</tr>
		<tr>
			<td style="width:40px;"></td> <!--actually works as indentation from title image above;-->
			<td class="cls-table-cap-desc">
				This is the list of electric vehicles which are produced by the well-known companies: 
			</td>
		</tr>
	</table>

<form id="this_is_the_table_container" runat="server">
	<div class="obout-table-pos">
		<obout:Grid id = "grid_0" runat="server" width="90%"
			AutoGenerateColumns    = "false"
			AllowAddingRecords     = "false"
			AllowFiltering         = "true"
			AllowPageSizeSelection = "false"
			DataSourceID = "DS_Cars"
			FolderStyle  = "~/Content/grid_styles/black_glass"
			NumberOfPagesShownInFooter = "1"
			PageSize     = "500"
			ShowFooter   = "false"
		>
			<Columns>
				<obout:Column DataField="Id"    ReadOnly="true" HeaderText="Brand"   Width="0%" />
				<obout:Column DataField="Brand" ReadOnly="true" HeaderText="Brand"   Width="17%" />
				<obout:Column DataField="Model" ReadOnly="true" HeaderText="Model"   Width="33%" />
				<obout:Column DataField="Image" ReadOnly="true" HeaderText="Picture" Width="50%" Align="center">
					<TemplateSettings TemplateID="ImageTemplate" />
				</obout:Column>
			</Columns>
			<FilteringSettings InitialState="Hidden" FilterPosition="Top" FilterLinksPosition="Bottom" />
			<Templates>
				<obout:GridTemplate runat="server" ID="ImageTemplate">
					<Template>
						<!-- https://stackoverflow.com/questions/15278616/the-server-tag-is-not-well-formed-error -->
						<asp:Image runat="server" ImageUrl='<%# GetBindString(Container.DataItem["Id"].ToString())%>'  />
					</Template>
				</obout:GridTemplate>
			</Templates>
		</obout:Grid>
		<asp:SqlDataSource
			id="DS_Cars"
			SelectCommand="select [Id], [Brand], [Model] from [dbo].[Cars] order by [Brand] asc, [Model] asc" 
			runat="server"
			ConnectionString='<%$ ConnectionStrings:DefaultConnection %>'
			ProviderName="System.Data.SqlClient" />
	</div>
</form>

	<div class="div-refs-active div-refs-pos div-refs-text">
		<div class="div-refs-border"></div>
		<table style="border:0;padding-left:10px;padding-top:5px;">
			<!-- https://en.wikipedia.org/wiki/Internet_censorship_in_the_United_States -->
			<tr>
				<td style="vertical-align:top;">P.S.</td>
				<td>All links made on this site refer to government and officially registered organizations.<br/>
					Please note, some URL may be locked dependently from 
						<a href="#" onclick="javascript:fn_open_ref('https://en.wikipedia.org/wiki/Internet_censorship_in_the_United_States');">
						your IP-address or country of residence</a>;
				</td>
			</tr>
		</table>
	</div>
</div>

</body>
</html>