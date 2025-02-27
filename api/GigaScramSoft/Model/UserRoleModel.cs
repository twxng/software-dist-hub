using System.ComponentModel.DataAnnotations;

namespace GigaScramSoft.Model
{
    public class UserRoleModel
    {
        public int Id { get; set; }
        
        [Required]
        public required string Name { get; set; }
    }
}