using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GigaScramSoft.Model
{
    public class ScoreModel
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public UserModel User { get; set; }
        [Required]
        public int ContentUnitId { get; set; }
        [ForeignKey("ContentUnitId")]
        public ContentUnitModel ContentUnit { get; set; }
        public bool IsPositive { get; set; }
    }
}
