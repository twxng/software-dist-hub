using GigaScramSoft.Model;

namespace GigaScramSoft.DTO
{
    public class ContentUnitDTO
    {
        public string Header { get; set; }
        public string ShortDescription { get; set; }
        public string FullDescription { get; set; }
        public string PreviewImage { get; set; }
        public string DownloadLink { get; set; }
        public string SubCategoryName { get; set; }
        public List<string> Images { get; set; }
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
        }
    }
}