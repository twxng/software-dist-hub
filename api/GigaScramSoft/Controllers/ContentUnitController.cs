using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GigaScramSoft.Model;
using GigaScramSoft.Services;
using GigaScramSoft.DTO;

namespace GigaScramSoft.Controllers
{
    public class ContentUnitController : ControllerBase
    {
        private IContentUnitService _contentUnitService;
        private IScoreService _scoreService;
        public ContentUnitController(IContentUnitService contentUnitService, IScoreService scoreService)
        {
            _contentUnitService = contentUnitService;
            _scoreService = scoreService;
        }

        [HttpPost("Create")]
        [Authorize]
        [ProducesResponseType(typeof(ResponseModel<ContentUnitModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseModel<ContentUnitModel>), StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<ResponseModel<ContentUnitModel>>> Create([FromBody] ContentUnitDTO contentUnitDTO)
        {
            var userRole = User.FindFirst("Role")?.Value;

            if (userRole != "Admin")
            {
                return Unauthorized(new ResponseModel<ContentUnitModel>
                {
                    Data = null,
                    Message = "You aren't admin",
                    Error = true,
                    StatusCode = HttpStatusCode.Unauthorized
                });
            }

            var result = await _contentUnitService.CreateContentUnit(contentUnitDTO);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpPut("Update")]
        [Authorize]
        [ProducesResponseType(typeof(ResponseModel<ContentUnitModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseModel<ContentUnitModel>), StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<ResponseModel<ContentUnitModel>>> Update(int contentId, [FromBody]ContentUnitDTO contentUnitDTO)
        {
            var result = await _contentUnitService.UpdateContentUnit(contentId, contentUnitDTO);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ResponseModel<ContentUnitModel>>> GetById(int contentId)
        {
            var result = await _contentUnitService.GetContentUnitById(contentId);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpDelete("DeleteById")]
        public async Task<ActionResult<ResponseModel<bool>>> DeleteById(int contentId)
        {
            var result = await _contentUnitService.DeleteContentUnit(contentId);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("GetAllCategories")]
        public async Task<ActionResult<ResponseModel<List<ContentUnitSubCategoryModel>>>> GetAllCategories()
        {
            var result = await _contentUnitService.GetAllCategories();
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpPut("SetScore")]
        [Authorize]
        public async Task<ActionResult<ResponseModel<bool>>> SetScore(int contentUnit, bool IsPositive)
        {
            var userId = int.Parse(User.FindFirst("Id")?.Value);
            var result = await _scoreService.SetScore( userId, contentUnit, IsPositive);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("GetScore")]
        public async Task<ActionResult<ResponseModel<int>>> GetScore(int contentUnit)
        {
            var result = await _scoreService.GetTotalScore(contentUnit);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("GetContentPage")]
        public async Task<ActionResult<ResponseModel<int>>> GetContentPage(int pageNumber,  int subCategoryId)
        {
            var result = await _contentUnitService.GetContentPageDTO(pageNumber, unitsPerPage: 10, subCategoryId, searchPattern: string.Empty);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("SearchByName")]
        public async Task<ActionResult<ResponseModel<int>>> GetContentPage(int pageNumber, int subCategoryId, string searchPattern)
        {
            var result = await _contentUnitService.GetContentPageDTO(pageNumber, unitsPerPage: 10, subCategoryId, searchPattern);
            return StatusCode((int)result.StatusCode, result);
        }
    }
}