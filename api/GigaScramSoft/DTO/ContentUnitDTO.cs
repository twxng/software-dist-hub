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
    }
}
