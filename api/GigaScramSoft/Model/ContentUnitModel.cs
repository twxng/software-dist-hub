using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GigaScramSoft.Model
{
    public class ContentUnitModel
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(150)]
        public string Header { get; set; } = string.Empty;
        [Required]
        [MaxLength(500)]
        public string ShortDescription { get; set; } = string.Empty;
        [Required]
        [MaxLength(1500)]
        public string FullDescription { get; set; } = string.Empty;
        [Required]
        public string PreviewImage { get; set; } = string.Empty;
        [Required]
        public DateTime CreationDate { get; set; }
        [Required]
        public string DownloadLink { get; set; } = string.Empty;
        [Required]
        public int SubCategoryId { get; set; }
        [ForeignKey("SubCategoryId")]
        public ContentUnitSubCategoryModel SubCategory { get; set; } = null!;
        public List<ContentUnitImageModel> Images { get; set; } = new List<ContentUnitImageModel>();
    }
}