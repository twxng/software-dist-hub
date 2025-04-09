using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GigaScramSoft.Model;
using GigaScramSoft.Services;
using GigaScramSoft.DTO;
using System.Security.Claims;

namespace GigaScramSoft.Controllers
{
    public class ContentUnitController : ControllerBase
    {
        private IContentUnitService _contentUnitService;
        private IScoreService _scoreService;
        
        public ContentUnitController(
            IContentUnitService contentUnitService, 
            IScoreService scoreService)
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

        /// <summary>
        /// Updates an existing content unit with the provided data.
        /// </summary>
        /// <param name="contentId">The unique identifier of the content unit to be updated.</param>
        /// <param name="contentUnitDTO">The updated data for the content unit.</param>
        /// <returns>A ResponseModel containing the updated content unit or an error message if the user is not authorized.</returns>
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

        [HttpGet("SearchByName")]
        public async Task<ActionResult<ResponseModel<ContentPageDTO>>> SearchByName(string searchPattern, int pageNumber = 1, int subCategoryId = 0, int unitsPerPage = 10)
        {
            try
            {
                var result = await _contentUnitService.GetContentPageDTO(pageNumber, unitsPerPage, subCategoryId, searchPattern);
                return StatusCode((int)result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseModel<ContentPageDTO>
                {
                    Data = null,
                    Message = ex.Message,
                    Error = true,
                    StatusCode = System.Net.HttpStatusCode.InternalServerError
                });
            }
        }

        [HttpGet("GetSuggestions")]
        public async Task<ActionResult<ResponseModel<List<string>>>> GetSuggestions(string query)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query))
                {
                    return Ok(new ResponseModel<List<string>>(new List<string>(), "Empty query", System.Net.HttpStatusCode.OK));
                }

                List<string> allSuggestions = new List<string>();

                try
                {
                    var allContent = await _contentUnitService.GetAllContentUnits();
                    
                    if (!allContent.Error && allContent.Data != null)
                    {
                        var contentSuggestions = allContent.Data
                            .Where(c => c.Header.Contains(query, StringComparison.OrdinalIgnoreCase))
                            .Select(c => c.Header)
                            .ToList();

                        allSuggestions.AddRange(contentSuggestions);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error getting content units: {ex.Message}");
                }

                try
                {
                    var categoriesResult = await _contentUnitService.GetAllCategories();
                    
                    if (!categoriesResult.Error && categoriesResult.Data != null)
                    {
                        var categorySuggestions = new List<string>();
                        
                        foreach (var category in categoriesResult.Data)
                        {
                            if (category.MainCategory != null)
                            {
                                bool mainCatContains = category.MainCategory.Name.Contains(query, StringComparison.OrdinalIgnoreCase);
                                bool subCatContains = category.Name.Contains(query, StringComparison.OrdinalIgnoreCase);
                                
                                if (mainCatContains || subCatContains)
                                {
                                    categorySuggestions.Add($"{category.MainCategory.Name} / {category.Name}");
                                }
                            }
                        }
                        
                        allSuggestions.AddRange(categorySuggestions);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error getting categories: {ex.Message}");
                }

                allSuggestions = allSuggestions.Distinct().Take(8).ToList();

                if (allSuggestions.Count == 0 && query.Length >= 1)
                {
                    allSuggestions.Add(query);
                }

                return Ok(new ResponseModel<List<string>>(allSuggestions, "Suggestions found", System.Net.HttpStatusCode.OK));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetSuggestions: {ex.Message}");
                
                return Ok(new ResponseModel<List<string>>(
                    new List<string>(), 
                    "Error processing suggestions, but continuing with empty results",
                    System.Net.HttpStatusCode.OK
                ));
            }
        }

        [HttpGet("GetContentPage")]
        public async Task<ActionResult<ResponseModel<ContentPageDTO>>> GetContentPage(int pageNumber, int subCategoryId, string searchPattern)
        {
            var result = await _contentUnitService.GetContentPageDTO(pageNumber, unitsPerPage: 10, subCategoryId, searchPattern);
            return StatusCode((int)result.StatusCode, result);
        }
        
        /// <summary>
        /// Get the total score of a content unit
        /// </summary>
        /// <param name="contentId">ID of the content unit</param>
        /// <returns>The total score value</returns>
        [HttpGet("GetScore")]
        [ProducesResponseType(typeof(ResponseModel<int>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseModel<int>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ResponseModel<int>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseModel<int>>> GetScore(int contentId)
        {
            try
            {
                var result = await _scoreService.GetTotalScore(contentId);
                return StatusCode((int)result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseModel<int>
                {
                    Data = 0,
                    Message = ex.Message,
                    Error = true,
                    StatusCode = HttpStatusCode.InternalServerError
                });
            }
        }
        
        /// <summary>
        /// Set a score (like or dislike) for a content unit
        /// </summary>
        /// <param name="contentId">ID of the content unit</param>
        /// <param name="isPositive">True for upvote, false for downvote</param>
        /// <returns>True if score was set successfully</returns>
        [HttpPut("SetScore")]
        [Authorize]
        [ProducesResponseType(typeof(ResponseModel<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseModel<bool>), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ResponseModel<bool>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ResponseModel<bool>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ResponseModel<bool>>> SetScore(int contentId, bool isPositive)
        {
            try
            {
                Console.WriteLine("### Claims analysis for SetScore ###");
                foreach (var claim in User.Claims)
                {
                    Console.WriteLine($"Claim type: {claim.Type}, Value: {claim.Value}");
                }
                
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    userIdClaim = User.FindFirst("Id") ?? User.FindFirst("UserId") ?? User.FindFirst("uid");
                }
                
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    Console.WriteLine("Failed to find user ID in claims");
                    return Unauthorized(new ResponseModel<bool>
                    {
                        Data = false,
                        Message = "Unable to identify user",
                        Error = true,
                        StatusCode = HttpStatusCode.Unauthorized
                    });
                }
                
                Console.WriteLine($"Identified user ID: {userId}");
                var result = await _scoreService.SetScore(userId, contentId, isPositive);
                return StatusCode((int)result.StatusCode, result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in SetScore: {ex.Message}");
                return StatusCode(500, new ResponseModel<bool>
                {
                    Data = false,
                    Message = ex.Message,
                    Error = true,
                    StatusCode = HttpStatusCode.InternalServerError
                });
            }
        }
    }
}