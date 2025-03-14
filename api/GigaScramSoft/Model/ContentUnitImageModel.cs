using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GigaScramSoft.Model
{
    public class ContentUnitImageModel
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Value { get; set; }
        [Required]
        public int ContentUnitId { get; set; }
        [ForeignKey("ContentUnitId")]
        public virtual ContentUnitModel ContentUnit { get; set; }
    }
}
