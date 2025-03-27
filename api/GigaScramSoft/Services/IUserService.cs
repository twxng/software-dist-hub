using GigaScramSoft.Model;

namespace GigaScramSoft.Services
{
    public interface IUserService
    {
        Task<ResponseModel<string>> Login(string login, string password);
        Task<ResponseModel<UserModel>> GetUserByLogin(string login);
        Task<ResponseModel<bool>> UpdatePassword(string username, string oldPassword, string newPassword);
        Task<ResponseModel<UserModel>> CreateUser(UserModel userModel, string roleName);
    }
}