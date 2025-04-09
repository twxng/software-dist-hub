using System.ComponentModel.DataAnnotations;

namespace GigaScramSoft.Model
{
    public class ContentUnitMainCategoryModel
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;
    }
}