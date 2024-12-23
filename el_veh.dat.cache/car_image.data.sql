/*
-- Created by Tech_dog (ebontrop@gmail.com) on 21-Jan-2017 at 10:41:16p, UTC+7, Phuket, Rawai, Saturday;
-- This is SQL script of predefined data for seeding country flag table of n.q.b.p project.
-----------------------------------------------------------------------------
-- Adopted to Electric Vehicle test project on 21-Dec-2024 at 18:26:47.150, UTC+7, Novosibirsk, Saturday;
*/
// https://learn.microsoft.com/en-us/sql/t-sql/statements/set-identity-insert-transact-sql?view=sql-server-ver16 ;
// https://stackoverflow.com/questions/3112579/identity-insert-is-set-to-off-how-to-turn-it-on ;
// important: only one table can be handled by IDENTITY_INSERT instruction at one time, otherwise the error will be thrown;

DELETE FROM [dbo].[Car_Image]
DELETE FROM [dbo].[Cars]
GO

SET IDENTITY_INSERT [dbo].[Cars] ON

INSERT INTO [dbo].[Cars] ([Id], [Brand], [Model]) VALUES (1, 'Audi', 'Audi-E-Tron-Luxury')
--INSERT INTO [dbo].[Cars] ([Id], [Brand], [Model]) VALUES (2, 'BMW' , 'BMW iX40')
INSERT INTO [dbo].[Cars] ([Id], [Brand], [Model]) VALUES (2, 'Honda' , 'Honda EV Ster Electric Sports')
INSERT INTO [dbo].[Cars] ([Id], [Brand], [Model]) VALUES (3, 'Mercedes Benz', 'Mercedes AMG GT Solarbeam')

SET IDENTITY_INSERT [dbo].[Cars] OFF

SET IDENTITY_INSERT [dbo].[Car_Image] ON

INSERT INTO [dbo].[Car_Image] ([Id],[Id_Car],[Data]) SELECT 1, 1, * FROM OPENROWSET(BULK N'D:\Abu\Under.The.Hood\el_veh.dat.cache\car_image\Audi-E-tron_128px.png', SINGLE_BLOB) RS
--INSERT INTO [dbo].[Car_Image] ([Id],[Id_Car],[Data]) SELECT 2, 2, * FROM OPENROWSET(BULK N'D:\Abu\Under.The.Hood\el_veh.dat.cache\car_image\BMW iX40_128px.png', SINGLE_BLOB) RS
INSERT INTO [dbo].[Car_Image] ([Id],[Id_Car],[Data]) SELECT 2, 2, * FROM OPENROWSET(BULK N'D:\Abu\Under.The.Hood\el_veh.dat.cache\car_image\Honda EV Ster Electric Sports_128px.png', SINGLE_BLOB) RS
INSERT INTO [dbo].[Car_Image] ([Id],[Id_Car],[Data]) SELECT 3, 3, * FROM OPENROWSET(BULK N'D:\Abu\Under.The.Hood\el_veh.dat.cache\car_image\Mercedes AMG GT Solarbeam_128px.png', SINGLE_BLOB) RS

SET IDENTITY_INSERT [dbo].[Car_Image] OFF
GO