using GigaScramSoft.Model;

namespace GigaScramSoft.DTO
{
    public class ContentPageDTO
    {
        public List<ContentUnitDTO> ContentUnits { get; set; } = new List<ContentUnitDTO>();
        public ContentUnitSubCategoryModel SubCategory { get; set; } = null!;
        public int PageNumber { get; set; }
        public int TotalNumberOfPages { get; set; }
        public bool IsTheLastPage { get; set; }
    }
}