using System.Net;
using GigaScramSoft.DTO;
using GigaScramSoft.Model;
using GigaScramSoft.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GigaScramSoft.Controllers
{
    public class CommentController : ControllerBase
    {
        private IContentUnitService _contentUnitService;
        private IUserService _userService;
        private ICommentService _commentService;

        public CommentController(IContentUnitService contentUnitService, IUserService userService, ICommentService commentService)
        {
            _contentUnitService = contentUnitService;
            _userService = userService;
            _commentService = commentService;
        }

        [HttpPost("CreateComment")]
        [Authorize]
        public async Task<ActionResult<ResponseModel<ContentUnitModel>>> Create(int contentId, string value)
        {
            var contentUnit = (await _contentUnitService.GetContentUnitById(contentId)).Data;

            if (contentUnit == null)
            {
                return StatusCode((int)System.Net.HttpStatusCode.InternalServerError, new ResponseModel<ContentUnitModel>(null, "There is no content unit with such id!", System.Net.HttpStatusCode.InternalServerError));
            }
            else
            {
                var login = User.FindFirst("Login")?.Value;
                if (login == null)
                {
                    return StatusCode((int)HttpStatusCode.Unauthorized,
                                       new ResponseModel<ContentUnitModel>(null, "User login not found in token!",
                                       HttpStatusCode.Unauthorized));
                }
                
                var user = (await _userService.GetUserByLogin(login)).Data;

                if (user == null)
                {
                    return StatusCode((int)HttpStatusCode.InternalServerError,
                                       new ResponseModel<ContentUnitModel>(null, "There is no user with such login!",
                                       HttpStatusCode.InternalServerError));
                }
                else
                {
                    var commentModel = new CommentModel
                    {
                        ContentUnitId = contentUnit.Id,
                        UserId = user.Id,
                        Value = value
                    };

                    var result = await _commentService.CreateComment(commentModel);
                    return StatusCode((int)result.StatusCode, result);
                }
            }
        }

        [HttpDelete("RemoveComment")]
        [Authorize]
        public async Task<ActionResult<ResponseModel<ContentUnitModel>>> Delete(int commentId)
        {
            var result = await _commentService.DeleteComment(commentId);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("GetComments")]
        public async Task<ActionResult<ResponseModel<CommentsPageDTO>>> GetComments(int contentUnitId, int pageNumber = 1)
        {
            var result = await _commentService.GetCommentsPageDTO(contentUnitId, pageNumber, 10);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("GetCountOfPagesWithComments")]
        public async Task<ActionResult<ResponseModel<int>>> GetCountOfPages(int contentUnitId)
        {
            var result = await _commentService.GetCommentsPageDTO(contentUnitId, 1, 10);

            if (result.Data == null)
            {
                return StatusCode(
                    (int)HttpStatusCode.InternalServerError,
                    new ResponseModel<int>
                    {
                        Data = 0,
                        Error = true,
                        Message = result.Message,
                        StatusCode = HttpStatusCode.InternalServerError
                    }
                );
            }
            else
            {
                return StatusCode(
                    (int)HttpStatusCode.OK,
                    new ResponseModel<int>
                    {
                        Data = result.Data.TotalNumberOfPages,
                        Error = false,
                        Message = "The total number of pages has been gotten successfully!",
                        StatusCode = HttpStatusCode.OK
                    }
                );
            }
        }
    }
}