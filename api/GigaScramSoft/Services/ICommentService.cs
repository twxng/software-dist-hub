using GigaScramSoft.DTO;
using GigaScramSoft.Model;

namespace GigaScramSoft.Services
{
    public interface ICommentService
    {
        Task<ResponseModel<CommentModel>> CreateComment(CommentModel commentModel);
        Task<ResponseModel<bool>> DeleteComment(int commentId);
        Task<ResponseModel<List<CommentModel>>> GetCommentsByContentUnitId(int contentModelId);
        Task<ResponseModel<CommentsPageDTO>> GetCommentsPageDTO(int contentModelId, int pageNumber, int unitsPerPage);
    }
}