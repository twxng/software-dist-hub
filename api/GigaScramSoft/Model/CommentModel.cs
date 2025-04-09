using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace GigaScramSoft.Model
{
    public class CommentModel
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public DateTime DateTime { get; set; }
        [Required]
        [MaxLength(500)]
        public string Value { get; set; } = string.Empty;
        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public UserModel User { get; set; } = null!;
        [Required]
        public int ContentUnitId { get; set; }
        [ForeignKey("ContentUnitId")]
        public virtual ContentUnitModel ContentUnit { get; set; } = null!;
    }
}