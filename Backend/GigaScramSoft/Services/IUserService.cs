using GigaScramSoft.Model;

namespace GigaScramSoft.Services
{
    public interface IUserService
    {
        Task<ResponseModel<string>> Login(string username, string password);
        Task<ResponseModel<UserModel>> CreateUser(UserModel userModel, string roleName);
        Task<ResponseModel<UserModel>> GetUserByUsername(string username);
        Task<ResponseModel<bool>> UpdatePassword(string username, string oldPassword, string newPassword);
    }
}