using GigaScramSoft.Model;

namespace GigaScramSoft.ViewModel
{
    public class CommentViewModel
    {
        public int Id { get; set; }
        public string Value { get; set; } = string.Empty;
        public int UserId { get; set; }
        public UserViewModel User { get; set; } = new();
        public int ContentUnitId { get; set; }
        public ContentUnitModel ContentUnit { get; set; } = null!;
        public DateTime DateTime { get; set; }

        public CommentViewModel(CommentModel commentModel)
        {
            Id = commentModel.Id;
            Value = commentModel.Value;
            UserId = commentModel.UserId;
            User = new UserViewModel(commentModel.User);
            ContentUnitId = commentModel.ContentUnitId;
            ContentUnit = commentModel.ContentUnit;
            DateTime = commentModel.DateTime;
        }
    }
}