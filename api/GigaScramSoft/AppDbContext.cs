using GigaScramSoft.Model;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace GigaScramSoft
{
    public class AppDbContext : DbContext
    {
        public DbSet<UserModel> Users { get; set; }
        public DbSet<UserRoleModel> Roles { get; set; }
        public DbSet<ContentUnitModel> ContentUnits { get; set; }
        public DbSet<ContentUnitImageModel> ContentUnitImages { get; set; }
        public DbSet<ContentUnitMainCategoryModel> ContentUnitMainCategories { get; set; }
        public DbSet<ContentUnitSubCategoryModel> ContentUnitSubCategories { get; set; }
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            modelBuilder.Entity<ContentUnitModel>()
                        .Navigation(c => c.Images)
                        .AutoInclude();

            modelBuilder.Entity<UserRoleModel>().HasData(
                new UserRoleModel { Id = 1, Name = "Admin" },
                new UserRoleModel { Id = 2, Name = "User" },
                new UserRoleModel { Id = 3, Name = "Guest" }
            );

            modelBuilder.Entity<UserModel>().HasData(
                new UserModel { Id = 1, Login = "admin", PasswordHash = "AQAAAAIAAYagAAAAEGLiW322/P8hJTxWa0SUJv0R/agf1XoFqzYySw2NR1o0NF2l6hU3murDZcKKWKEs3g==", Email = "admin@example.com", RoleId = 1 },
                new UserModel { Id = 2, Login = "user1", PasswordHash = "AQAAAAIAAYagAAAAEGLiW322/P8hJTxWa0SUJv0R/agf1XoFqzYySw2NR1o0NF2l6hU3murDZcKKWKEs3g==", Email = "user1@example.com", RoleId = 2 },
                new UserModel { Id = 3, Login = "bob", PasswordHash = "AQAAAAIAAYagAAAAEGLiW322/P8hJTxWa0SUJv0R/agf1XoFqzYySw2NR1o0NF2l6hU3murDZcKKWKEs3g==", Email = "bob@example.com", RoleId = 2 }
            );

            modelBuilder.Entity<ContentUnitMainCategoryModel>().HasData(
                new ContentUnitMainCategoryModel { Id = 1, Name = "Operating Systems" },
                new ContentUnitMainCategoryModel { Id = 2, Name = "Development & Programming" },
                new ContentUnitMainCategoryModel { Id = 3, Name = "Security & Privacy" },
                new ContentUnitMainCategoryModel { Id = 4, Name = "Multimedia & Design" },
                new ContentUnitMainCategoryModel { Id = 5, Name = "Productivity & Office Tools" },
                new ContentUnitMainCategoryModel { Id = 6, Name = "Networking & Internet" }
            );

            modelBuilder.Entity<ContentUnitSubCategoryModel>().HasData(
                new ContentUnitSubCategoryModel { Id = 1, Name = "Windows Software", MainCategoryId = 1 },
                new ContentUnitSubCategoryModel { Id = 2, Name = "MacOS Software", MainCategoryId = 1 },
                new ContentUnitSubCategoryModel { Id = 3, Name = "Linux Software", MainCategoryId = 1 },
                new ContentUnitSubCategoryModel { Id = 4, Name = "Mobile Apps (Android, iOS)", MainCategoryId = 1 },
                new ContentUnitSubCategoryModel { Id = 5, Name = "IDE & Code Editors", MainCategoryId = 2 },
                new ContentUnitSubCategoryModel { Id = 6, Name = "Frameworks & Libraries", MainCategoryId = 2 },
                new ContentUnitSubCategoryModel { Id = 7, Name = "Database Management", MainCategoryId = 2 },
                new ContentUnitSubCategoryModel { Id = 8, Name = "Version Control & DevOps", MainCategoryId = 2 },
                new ContentUnitSubCategoryModel { Id = 9, Name = "Antivirus & Anti-Malware", MainCategoryId = 3 },
                new ContentUnitSubCategoryModel { Id = 10, Name = "VPN & Proxy Software", MainCategoryId = 3 },
                new ContentUnitSubCategoryModel { Id = 11, Name = "Password Managers", MainCategoryId = 3 },
                new ContentUnitSubCategoryModel { Id = 12, Name = "Encryption Tools", MainCategoryId = 3 },
                new ContentUnitSubCategoryModel { Id = 13, Name = "Photo & Image Editing", MainCategoryId = 4 },
                new ContentUnitSubCategoryModel { Id = 14, Name = "Video Editing & Production", MainCategoryId = 4 },
                new ContentUnitSubCategoryModel { Id = 15, Name = "Audio Editing & Music Production", MainCategoryId = 4 },
                new ContentUnitSubCategoryModel { Id = 16, Name = "3D Modeling & Animation", MainCategoryId = 4 },
                new ContentUnitSubCategoryModel { Id = 17, Name = "Office Suites", MainCategoryId = 5 },
                new ContentUnitSubCategoryModel { Id = 18, Name = "Project Management", MainCategoryId = 5 },
                new ContentUnitSubCategoryModel { Id = 19, Name = "Note-Taking & Mind Mapping", MainCategoryId = 5 },
                new ContentUnitSubCategoryModel { Id = 20, Name = "PDF Tools", MainCategoryId = 5 },
                new ContentUnitSubCategoryModel { Id = 21, Name = "Browsers & Extensions", MainCategoryId = 6 },
                new ContentUnitSubCategoryModel { Id = 22, Name = "Download Managers", MainCategoryId = 6 },
                new ContentUnitSubCategoryModel { Id = 23, Name = "Remote Desktop & VPN", MainCategoryId = 6 },
                new ContentUnitSubCategoryModel { Id = 24, Name = "FTP & File Sharing", MainCategoryId = 6 }
            );
        }
    }
}