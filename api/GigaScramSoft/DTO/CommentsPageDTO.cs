using GigaScramSoft.Model;
using GigaScramSoft.ViewModel;

namespace GigaScramSoft.DTO
{
    public class CommentsPageDTO
    {
        public int ContentId { get; set; }
        public List<CommentViewModel> Comments { get; set; } = new List<CommentViewModel>();
        public int PageNumber { get; set; }
        public int TotalNumberOfPages { get; set; }
        public bool IsTheLastPage { get; set; }
    }
}