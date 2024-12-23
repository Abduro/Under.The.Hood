----------------------------------------------------------------------------
-- Created by Tech_dog (ebontrop@gmail.com) on 10-Feb-2017 at 11:21:58a, UTC+7, Phuket, Rawai, Friday;
-- This is n.q.b.p SeaStats project shared country and shared contact entities sql script file.
----------------------------------------------------------------------------
-- Adopted to Electric Vehicle test project on 20-Dec-2024 at 18:25:13.49, UTC+4, Batumi, Friday;
----------------------------------------------------------------------------

--
-- This is the main table of cars' list;
--
--DROP TABLE [dbo].[Cars]
CREATE TABLE [dbo].[Cars](
    [Id] INT IDENTITY (1,1) NOT NULL, 
    [Brand] NVARCHAR(50) COLLATE SQL_Latin1_General_CP1_CS_AS NOT NULL,
    [Model] NVARCHAR(50) COLLATE SQL_Latin1_General_CP1_CS_AS NOT NULL, 
CONSTRAINT [PK_Cars] PRIMARY KEY CLUSTERED 
(
    [Id] ASC
) WITH (PAD_INDEX  = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
)
GO
--
-- This is the table of car images for displaying on pages of the web application;
-- 
--DROP TABLE [dbo].[Car_Image]
CREATE TABLE [dbo].[Car_Image](
    [Id]     INT IDENTITY (1,1) NOT NULL,
    [Id_Car] INT NOT NULL,
    [Data]   [varbinary](max)   NOT NULL,
CONSTRAINT [PK_Car_Image] PRIMARY KEY CLUSTERED 
(
    [Id] ASC
)WITH (PAD_INDEX  = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[Car_Image] WITH CHECK ADD CONSTRAINT [FK_Car_Image_Ref] FOREIGN KEY([Id_Car])
REFERENCES  [dbo].[Cars] ([Id])
GO
ALTER TABLE [dbo].[Car_Image] CHECK CONSTRAINT [FK_Car_Image_Ref]
GO

--
-- https://stackoverflow.com/questions/17501840/how-can-i-find-out-what-foreign-key-constraint-references-a-table-in-sql-server ;
-- otherwise there is no info about foreign key constraint in Server Explorer of the VS;
sp_help 'Car_Image'

-----------------------------------------------------------------------------
--
-- UI Schema Objects
--
-----------------------------------------------------------------------------
--DROP FUNCTION [dbo].[f$car_image_by_ref]
CREATE FUNCTION [dbo].[f$car_image_by_ref]
(
    @car_id  INT
)
RETURNS TABLE
AS RETURN (
    SELECT [Data] FROM [dbo].[Car_Image] WHERE [Id_car] = @car_id
);
GO
--SELECT * FROM [dbo].[f$car_image_by_ref](0)
