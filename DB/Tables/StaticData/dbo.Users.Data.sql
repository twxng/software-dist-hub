SET IDENTITY_INSERT dbo.Users ON
GO
INSERT dbo.Users(Id, Login, PasswordHash, Email, RoleId) VALUES (1, N'admin', N'AQAAAAIAAYagAAAAEGLiW322/P8hJTxWa0SUJv0R/agf1XoFqzYySw2NR1o0NF2l6hU3murDZcKKWKEs3g==', N'admin@example.com', 1);
INSERT dbo.Users(Id, Login, PasswordHash, Email, RoleId) VALUES (2, N'user1', N'AQAAAAIAAYagAAAAEGLiW322/P8hJTxWa0SUJv0R/agf1XoFqzYySw2NR1o0NF2l6hU3murDZcKKWKEs3g==', N'user1@example.com', 2);
INSERT dbo.Users(Id, Login, PasswordHash, Email, RoleId) VALUES (3, N'bob', N'AQAAAAIAAYagAAAAEGLiW322/P8hJTxWa0SUJv0R/agf1XoFqzYySw2NR1o0NF2l6hU3murDZcKKWKEs3g==', N'bob@example.com', 2);
GO
SET IDENTITY_INSERT dbo.Users OFF
GO