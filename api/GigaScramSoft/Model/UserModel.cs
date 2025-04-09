using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GigaScramSoft.Model
{
    public class UserModel
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(50)]
        public string Login { get; set; } = string.Empty;
        [Required]
        [MaxLength(100)]
        public string PasswordHash { get; set; } = string.Empty;
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        [Required]
        public int RoleId { get; set; }
        [ForeignKey("RoleId")]
        public UserRoleModel Role { get; set; } = null!;
    }
}