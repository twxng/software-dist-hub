using GigaScramSoft.Model;

namespace GigaScramSoft.DTO
{
    public class ContentUnitDTO
    {
        public string Header { get; set; } = string.Empty;
        public string ShortDescription { get; set; } = string.Empty;
        public string FullDescription { get; set; } = string.Empty;
        public string PreviewImage { get; set; } = string.Empty;
        public string DownloadLink { get; set; } = string.Empty;
        public string SubCategoryName { get; set; } = string.Empty;
        public List<string> Images { get; set; } = new List<string>();
        
        public ContentUnitDTO()
        {
            
        }
        
        public ContentUnitDTO(ContentUnitModel contentUnitModel)
        {
            Header = contentUnitModel.Header;
            ShortDescription = contentUnitModel.ShortDescription;
            FullDescription = contentUnitModel.FullDescription;
            PreviewImage = contentUnitModel.PreviewImage;
            DownloadLink = contentUnitModel.DownloadLink;
            SubCategoryName = contentUnitModel.SubCategory.Name;
            Images = new List<string>();
        }
    }
}