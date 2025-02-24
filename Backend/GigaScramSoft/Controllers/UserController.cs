using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GigaScramSoft.Model;
using GigaScramSoft.Services;
using GigaScramSoft.ViewModel;

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
            var userModel = new UserModel();
            userModel.Email = email;
            userModel.Login = login;
            userModel.PasswordHash = password;

            var result = await _userService.CreateUser(userModel, "User");
            var userViewModel = new UserViewModel();

            if (result.Data != null)
            {
                userViewModel.Id = result.Data.Id;
                userViewModel.Email = result.Data.Email;
                userViewModel.Login = result.Data.Login;
                userViewModel.RoleName = result.Data.Role.Name;
            }

            result.Data = userModel;

            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("GetProfile")]
        [Authorize]
        public async Task<ActionResult<ResponseModel<UserViewModel>>> GetProfile()
        {
            var userLogin = User.FindFirst("Login").Value;
            var result = await _userService.GetUserByUsername(userLogin);

            UserViewModel userViewModel = new UserViewModel();
            userViewModel.Id = result.Data.Id;
            userViewModel.Email = result.Data.Email;
            userViewModel.Login = result.Data.Login;
            userViewModel.RoleName = result.Data.Role.Name;

            return StatusCode((int)result.StatusCode, userViewModel);
        }

        [HttpPut("UpdatePassword")]
        [Authorize]
        public async Task<ActionResult<ResponseModel<bool>>> UpdatePassword(string oldPassword, string newPassword)
        {
            var userLogin = User.FindFirst("Login").Value;
            ResponseModel<bool>  result = await _userService.UpdatePassword(userLogin, oldPassword, newPassword);
            return StatusCode((int)result.StatusCode, result);
        }
    }
}