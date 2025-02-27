SET IDENTITY_INSERT dbo.Roles ON
GO
INSERT dbo.Roles(Id, Name) VALUES (1, N'Admin');
INSERT dbo.Roles(Id, Name) VALUES (2, N'User');
INSERT dbo.Roles(Id, Name) VALUES (3, N'Guest');
GO
SET IDENTITY_INSERT dbo.Roles OFF
GO