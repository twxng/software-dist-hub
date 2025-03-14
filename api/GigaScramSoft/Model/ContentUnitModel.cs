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
        public string Header { get; set; }
        [Required]
        [MaxLength(500)]
        public string ShortDescription { get; set; }
        [Required]
        [MaxLength(1500)]
        public string FullDescription { get; set; }
        [Required]
        public string PreviewImage { get; set; }
        [Required]
        public DateTime CreationDate { get; set; }
        [Required]
        public string DownloadLink { get; set; }
        [Required]
        public int SubCategoryId { get; set; }
        [ForeignKey("SubCategoryId")]
        public ContentUnitSubCategoryModel SubCategory { get; set; }
        public List<ContentUnitImageModel> Images { get; set; } = new List<ContentUnitImageModel>();
    }
}