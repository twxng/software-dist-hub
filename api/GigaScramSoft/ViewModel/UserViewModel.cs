using GigaScramSoft.Model;

namespace GigaScramSoft.ViewModel
{
    public class UserViewModel
    {
        public int Id { get; set; }
        public string Login { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;

        public UserViewModel() { }

        public UserViewModel(UserModel userModel)
        {
            Id = userModel.Id;
            Login = userModel.Login;
            Email = userModel.Email;
            RoleName = userModel.Role.Name;
        }
    }
}