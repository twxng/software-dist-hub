using GigaScramSoft.DTO;
using GigaScramSoft.Model;

namespace GigaScramSoft.Services
{
    public interface IContentUnitService
    {
        Task<ResponseModel<ContentUnitModel>> CreateContentUnit(ContentUnitDTO contentUnitDTO);
        Task<ResponseModel<bool>> DeleteContentUnit(int contentId);
        Task<ResponseModel<ContentUnitModel>> UpdateContentUnit(int contentId, ContentUnitDTO contentUnitDTO);
        Task<ResponseModel<List<ContentUnitSubCategoryModel>>> GetAllCategories();
        Task<ResponseModel<List<ContentUnitSubCategoryModel>>> GetSubCategoriesByMainCategoryId(int mainCategoryId);
        Task<ResponseModel<ContentUnitModel>> GetContentUnitById(int contentId);
        Task<ResponseModel<List<ContentUnitModel>>> GetAllContentUnits();
        Task<ResponseModel<List<ContentUnitModel>>> GetContentUnitsBySubCategoryId(int subCategoryId);
        Task<ResponseModel<List<ContentUnitModel>>> GetContentUnitsBySubCategoryName(string subCategoryName);
        Task<ResponseModel<ContentPageDTO>> GetContentPageDTO(int numberOfPage, int unitsPerPage, int subCategoryId, string searchPattern);
    }
}