using GigaScramSoft.Model;

namespace GigaScramSoft.ViewModel
{
    public class UserViewModel
    {
        public int Id { get; set; }
        public string Login { get; set; }
        public string Email { get; set; }
        public string RoleName { get; set; }

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