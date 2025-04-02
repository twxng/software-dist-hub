using GigaScramSoft.Model;

namespace GigaScramSoft.DTO
{
    public class ContentPageDTO
    {
        public List<ContentUnitDTO> ContentUnits { get; set; }
        public ContentUnitSubCategoryModel SubCategory { get; set; }
        public int PageNumber { get; set; }
        public int TotalNumberOfPages { get; set; }
        public bool IsTheLastPage { get; set; }
    }
}