using System.Text;
using GigaScramSoft.Auth;
using GigaScramSoft.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace GigaScramSoft.Services
{
    public class UserService : IUserService
    {
        AppDbContext _appDbContext;
        IOptions<AuthSettings> _options;

        public UserService(AppDbContext appDbContext, IOptions<AuthSettings> options)
        {
            _options = options;
            _appDbContext = appDbContext;
        }
        public string GenerateJwtToken(UserModel? user)
        {
            var claims = new List<Claim>
            {
                new Claim("Id", user.Id.ToString()),
                new Claim("Login", user.Login)
            };

            var jwtToken = new JwtSecurityToken(
                expires: DateTime.UtcNow.Add(_options.Value.Expires),
                claims: claims,
                signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Value.SecretKey)), SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(jwtToken);
        }
        public async Task<ResponseModel<string>> Login(string username, string password)
        {
            try
            {
                var user = (await GetUserByUsername(username)).Data;

                if (user == null)
                {
                    throw new Exception($"{username} has not been found!");
                }
                else
                {
                    var passwordHashVerificationResult = new PasswordHasher<UserModel>().VerifyHashedPassword(user, user.PasswordHash, password);

                    if (passwordHashVerificationResult == PasswordVerificationResult.Success)
                    {
                        //generate jwt
                        var jwtToken = "Bearer " + GenerateJwtToken(user);
                        var response = new ResponseModel<string>(jwtToken, $"JWT Token has been successfully generated!", System.Net.HttpStatusCode.OK);
                        return response;
                    }
                    else
                    {
                        throw new Exception("Wrong password!");
                    }
                }
            }
            catch (Exception ex)
            {
                var response = new ResponseModel<string>(String.Empty, $"{ex.Message}", System.Net.HttpStatusCode.InternalServerError);
                return await Task.FromResult(response);
            }
        }
        public async Task<ResponseModel<UserModel>> GetUserByUsername(string username)
        {
            var users = await _appDbContext.Users
                        .Include(u => u.Role)
                        .ToListAsync();
            var foundUser = users.Find(u => { return u.Login.Equals(username); });
            var response = new ResponseModel<UserModel>(foundUser, foundUser != null ? "User has been found!" : "User has not been found!", System.Net.HttpStatusCode.OK);

            return response;
        }
        public async Task<ResponseModel<bool>> UpdatePassword(string username, string oldPassword, string newPassword)
        {
            try
            {
                var user = (await GetUserByUsername(username)).Data;
                var passwordHashVerificationResult = new PasswordHasher<UserModel>().VerifyHashedPassword(user, user.PasswordHash, oldPassword);

                if (passwordHashVerificationResult == PasswordVerificationResult.Success)
                {
                    if (user != null)
                    {
                        user.PasswordHash = new PasswordHasher<UserModel>().HashPassword(user, newPassword);

                        _appDbContext.Update(user);
                        await _appDbContext.SaveChangesAsync();

                        var response = new ResponseModel<bool>(true, $"Profile with username {username} has been updated!", System.Net.HttpStatusCode.OK);
                        return await Task.FromResult(response);
                    }
                    else
                    {
                        throw new Exception("User with such login has not found!");
                    }
                }
                else
                {
                    throw new Exception("You have entered wrong password!");
                }
            }
            catch (Exception ex)
            {
                var response = new ResponseModel<bool>(false, $"{ex.Message}", System.Net.HttpStatusCode.InternalServerError);
                return await Task.FromResult(response);
            }
        }
        public async Task<ResponseModel<UserModel>> CreateUser(UserModel userModel, string roleName)
        {
            try
            {
                var providedPassword = userModel.PasswordHash;
                userModel.PasswordHash = new PasswordHasher<UserModel>().HashPassword(userModel, userModel.PasswordHash);

                var userByLogin = await _appDbContext.Users.FirstOrDefaultAsync(u => u.Login.Equals(userModel.Login));
                if (userByLogin != null) throw new Exception($"User with the same login already exists!");

                var userByEmail = await _appDbContext.Users.FirstOrDefaultAsync(u => u.Login.Equals(userModel.Email));
                if (userByEmail != null) throw new Exception($"User with the same email already exists!");

                var role = (await _appDbContext.Roles.ToListAsync()).Find((r) => { return r.Name.Equals(roleName); });
                if (role == null) throw new Exception($"Role with the specified name has not been found!");
                userModel.Role = role;
                userModel.RoleId = userModel.RoleId;

                await _appDbContext.Users.AddAsync(userModel);
                await _appDbContext.SaveChangesAsync();

                var response = new ResponseModel<UserModel>(userModel, $"User has been created successfully!", System.Net.HttpStatusCode.OK);
                return response;
            }
            catch (Exception ex)
            {
                var response = new ResponseModel<UserModel>(null, $"{ex.Message}", System.Net.HttpStatusCode.InternalServerError);
                return await Task.FromResult(response);
            }
        }
    }
}