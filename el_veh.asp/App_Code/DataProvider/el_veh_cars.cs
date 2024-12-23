/*
	Created by Tech_dog (ebontrop@gmail.com) on 26-Jan-2017 at 16:43:07.45, UTC+7, Phuket, Rawai, Thursday;
	This is n.q.b.p SeaStats project country flag image loader HTTP request handler definoition file;
	-----------------------------------------------------------------------------
	Adopted to Electric Vehicle project on 21-Dec-2024 at 02:44:08.189, UTC+7, Novosibirsk, Saturday;
*/
using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;

namespace el_veh { namespace asp {


	public class CCarImage {
	public CCarImage () {
	}

	public bool Get (int _car_id, ref Byte[] _data) {

		bool b_result = false;

		if (1 > _car_id)
			return b_result;

	//	ConnectionStringSettingsCollection conn_collect = ConfigurationManager.ConnectionStrings;
	//	ConnectionStringSettings conn_strings = conn_collect["DefaultConnection"];

	//	string s_connect = conn_strings.ToString();
		string s_connect = ConfigurationManager.ConnectionStrings["DefaultConnection"].ToString();
		string s_command = String.Format("SELECT * FROM [dbo].[f$car_image_by_ref]({0})", _car_id);

		using (SqlConnection o_connect = new SqlConnection(s_connect)) {

			SqlCommand cmd_ = new SqlCommand(s_command, o_connect);
			DataTable  tbl_ = new DataTable();

			cmd_.CommandType = CommandType.Text;

			using (SqlDataAdapter adapter_ = new SqlDataAdapter()) {

				try {
					adapter_.SelectCommand = cmd_;
					adapter_.Fill(tbl_);
					if (null != tbl_ && 0 < tbl_.Rows.Count) {
						_data = (Byte[])tbl_.Rows[0][0];
						b_result = true;
					}

				} catch (SqlException) {}
			}
		}
		return b_result;
	}};

}}