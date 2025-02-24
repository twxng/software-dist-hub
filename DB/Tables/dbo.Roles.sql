CREATE TABLE [dbo].[Roles] (
  [Id] [int] IDENTITY,
  [Name] [nvarchar](50) NOT NULL,
  CONSTRAINT [PK_Roles] PRIMARY KEY CLUSTERED ([Id])
)
ON [PRIMARY]
GO