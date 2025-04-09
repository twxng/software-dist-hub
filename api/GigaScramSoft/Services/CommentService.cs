using GigaScramSoft.DTO;
using GigaScramSoft.Model;
using GigaScramSoft.ViewModel;
using Microsoft.EntityFrameworkCore;

namespace GigaScramSoft.Services
{
    public class CommentService : ICommentService
    {
        AppDbContext appDbContext;
        public CommentService(AppDbContext _appDbContext)
        {
            appDbContext = _appDbContext;
        }

        public async Task<ResponseModel<CommentModel>> CreateComment(CommentModel commentModel)
        {
            try
            {
                commentModel.DateTime = DateTime.Now;
                await appDbContext.AddAsync(commentModel);
                await appDbContext.SaveChangesAsync();

                if (commentModel.ContentUnit != null)
                {
                    commentModel.ContentUnit.PreviewImage = "";
                    commentModel.ContentUnit.Images = new List<ContentUnitImageModel>();
                }

                return new ResponseModel<CommentModel>(
                                                        commentModel,
                                                        "The comment has been created successfully!",
                                                        System.Net.HttpStatusCode.OK
                                                       );
            }
            catch (Exception exception)
            {
                return new ResponseModel<CommentModel>(
                                                        null,
                                                        exception.Message,
                                                        System.Net.HttpStatusCode.InternalServerError
                                                      );
            }
        }

        public async Task<ResponseModel<bool>> DeleteComment(int commentId)
        {
            try
            {
                await appDbContext.Comments.Where(c => c.Id == commentId).ExecuteDeleteAsync();

                return new ResponseModel<bool>(
                                                true,
                                                "The comment has been deleted successfully!",
                                                System.Net.HttpStatusCode.OK
                                               );
            }
            catch (Exception exception)
            {
                return new ResponseModel<bool>(
                                                false,
                                                exception.Message,
                                                System.Net.HttpStatusCode.InternalServerError,
                                                true
                                              );
            }
        }

        public async Task<ResponseModel<List<CommentModel>>> GetCommentsByContentUnitId(int contentModelId)
        {
            try
            {
                var comments = await appDbContext.Comments
                                                 .Include(c => c.User)
                                                 .Include(c => c.User.Role)
                                                 .Where(c => c.ContentUnitId == contentModelId)
                                                 .ToListAsync();

                var commentsVM = new List<CommentViewModel>();

                foreach (var comment in comments)
                {
                    commentsVM.Add(new CommentViewModel(comment));
                }

                return new ResponseModel<List<CommentModel>>(
                                                        comments,
                                                        "The comments has been gotten successfully!",
                                                        System.Net.HttpStatusCode.OK
                                                       );
            }
            catch (Exception exception)
            {
                return new ResponseModel<List<CommentModel>>(
                                                        null,
                                                        exception.Message,
                                                        System.Net.HttpStatusCode.InternalServerError,
                                                        true
                                                      );
            }
        }

        public async Task<ResponseModel<CommentsPageDTO>> GetCommentsPageDTO(int contentModelId, int pageNumber, int unitsPerPage = 10)
        {
            try
            {
                var commentsResponse = await GetCommentsByContentUnitId(contentModelId);
                var comments = commentsResponse.Data;
                var commentsPageDTO = new CommentsPageDTO();

                if (comments == null || comments.Count == 0) 
                {
                    commentsPageDTO.Comments = new List<CommentViewModel>();
                    commentsPageDTO.ContentId = contentModelId;
                    commentsPageDTO.PageNumber = pageNumber;
                    commentsPageDTO.TotalNumberOfPages = 0;
                    commentsPageDTO.IsTheLastPage = true;
                    
                    return new ResponseModel<CommentsPageDTO>
                    {
                        Data = commentsPageDTO,
                        Error = true,
                        Message = "There are no comments for such content unit.",
                        StatusCode = System.Net.HttpStatusCode.OK
                    };
                }

                if (comments.Count > unitsPerPage)
                {
                    commentsPageDTO.TotalNumberOfPages = comments.Count / unitsPerPage + (comments.Count % unitsPerPage > 0 ? 1 : 0);
                }
                else
                {
                    commentsPageDTO.TotalNumberOfPages = 1;
                }

                if (pageNumber > commentsPageDTO.TotalNumberOfPages || pageNumber <= 0)
                {
                    commentsPageDTO.Comments = new List<CommentViewModel>();
                    commentsPageDTO.ContentId = contentModelId;
                    commentsPageDTO.PageNumber = 1;
                    commentsPageDTO.IsTheLastPage = true;
                    
                    return new ResponseModel<CommentsPageDTO>
                    {
                        Data = commentsPageDTO,
                        Error = true,
                        Message = "The number of page is higher than total number of pages.",
                        StatusCode = System.Net.HttpStatusCode.BadRequest
                    };
                }
                else
                {
                    List<CommentViewModel> commentsVM = new List<CommentViewModel>();
                    comments.ForEach(comment => 
                    {
                        if (comment != null)
                        {
                            commentsVM.Add(new CommentViewModel(comment));
                        }
                    });

                    commentsPageDTO.Comments = commentsVM.Skip((pageNumber - 1) * unitsPerPage).Take(unitsPerPage).ToList();
                    commentsPageDTO.IsTheLastPage = pageNumber == commentsPageDTO.TotalNumberOfPages;
                    commentsPageDTO.ContentId = contentModelId;
                    commentsPageDTO.PageNumber = pageNumber;
                    
                    var result = new ResponseModel<CommentsPageDTO>
                    {
                        Data = commentsPageDTO,
                        Error = false,
                        Message = "Page has been created successfully",
                        StatusCode = System.Net.HttpStatusCode.OK
                    };

                    return result;
                }
            }
            catch (Exception ex)
            {
                return new ResponseModel<CommentsPageDTO>(
                                                            null,
                                                            ex.Message,
                                                            System.Net.HttpStatusCode.InternalServerError,
                                                            true
                                                        );
            }
        }
    }
}