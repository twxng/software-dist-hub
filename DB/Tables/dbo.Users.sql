CREATE TABLE [dbo].[Users] (
  [Id] [int] IDENTITY,
  [Login] [nvarchar](50) NOT NULL,
  [PasswordHash] [nvarchar](100) NOT NULL,
  [Email] [nvarchar](max) NOT NULL,
  [RoleId] [int] NOT NULL,
  CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([Id])
)
ON [PRIMARY]
TEXTIMAGE_ON [PRIMARY]
GO

CREATE INDEX [IX_Users_RoleId]
  ON [dbo].[Users] ([RoleId])
  ON [PRIMARY]
GO

ALTER TABLE [dbo].[Users]
  ADD CONSTRAINT [FK_Users_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles] ([Id]) ON DELETE CASCADE
GO