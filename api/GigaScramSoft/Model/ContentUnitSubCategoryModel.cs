using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GigaScramSoft.Model
{
    public class ContentUnitSubCategoryModel
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; }

        [Required]
        public int MainCategoryId { get; set; }

        [ForeignKey("MainCategoryId")]
        public ContentUnitMainCategoryModel MainCategory { get; set; }
    }
}