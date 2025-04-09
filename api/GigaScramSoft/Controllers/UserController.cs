using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GigaScramSoft.Model;
using GigaScramSoft.Services;
using GigaScramSoft.ViewModel;
using System.Net;

namespace GigaScramSoft.Controllers
{
    public class UserController : ControllerBase
    {
        private IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("Login")]
        public async Task<ActionResult<ResponseModel<string>>> Login(string login, string password)
        {
            var result = await _userService.Login(login, password);
            return StatusCode((int) result.StatusCode, result);
        }

        //[HttpGet("Logout")]
        //[Authorize]
        //public ActionResult<bool> Logout()
        //{
        //    if (Request.Headers.ContainsKey("Authorization"))
        //    {
        //        Request.Headers.Remove("Authorization");
        //    }

        //    return StatusCode(200, true);
        //}

        [HttpPost("SignUp")]
        public async Task<ActionResult<ResponseModel<UserViewModel>>> SignUp(string login, string password, string email)
        {
            var userModel = new UserModel
            {
                Email = email,
                Login = login,
                PasswordHash = password
            };

            var resultFromService = await _userService.CreateUser(userModel, "User");
            var userViewModel = new UserViewModel
            {
                Id = resultFromService.Data?.Id ?? 0,
                Email = resultFromService.Data?.Email ?? string.Empty,
                Login = resultFromService.Data?.Login ?? string.Empty,
                RoleName = resultFromService.Data?.Role?.Name ?? string.Empty
            };

            var result = new ResponseModel<UserViewModel>(userViewModel, "OK");

            return StatusCode((int)resultFromService.StatusCode, result);
        }

        [HttpGet("GetProfile")]
        [Authorize]
        public async Task<ActionResult<ResponseModel<UserViewModel>>> GetProfile()
        {
            var userLogin = User.FindFirst("Login")?.Value;
            if (userLogin == null)
            {
                return StatusCode((int)HttpStatusCode.BadRequest, new ResponseModel<UserViewModel>
                {
                    Error = true,
                    Message = "Login not found in token",
                    StatusCode = HttpStatusCode.BadRequest
                });
            }
            
            var result = await _userService.GetUserByLogin(userLogin);
            if (result.Data == null)
            {
                return StatusCode((int)result.StatusCode, result);
            }

            UserViewModel userViewModel = new UserViewModel
            {
                Id = result.Data.Id,
                Email = result.Data.Email,
                Login = result.Data.Login,
                RoleName = result.Data.Role.Name
            };

            return StatusCode((int)result.StatusCode, userViewModel);
        }

        [HttpPut("UpdatePassword")]
        [Authorize]
        public async Task<ActionResult<ResponseModel<bool>>> UpdatePassword(string oldPassword, string newPassword)
        {
            var userLogin = User.FindFirst("Login")?.Value;
            if (userLogin == null)
            {
                return StatusCode((int)HttpStatusCode.BadRequest, new ResponseModel<bool>
                {
                    Error = true,
                    Message = "Login not found in token",
                    StatusCode = HttpStatusCode.BadRequest
                });
            }
            
            ResponseModel<bool> result = await _userService.UpdatePassword(userLogin, oldPassword, newPassword);
            return StatusCode((int)result.StatusCode, result);
        }
    }
}