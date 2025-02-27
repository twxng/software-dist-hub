using System.Text;
using GigaScramSoft.Auth;
using GigaScramSoft.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using System.Net;

namespace GigaScramSoft.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IOptions<AuthSettings> _options;

        public UserService(AppDbContext context, IConfiguration configuration, IOptions<AuthSettings> options)
        {
            _context = context;
            _configuration = configuration;
            _options = options;
        }

        public string GenerateJwtToken(UserModel user)
        {
            var claims = new List<Claim>
            {
                new Claim("Login", user.Login),
                new Claim("Email", user.Email),
                new Claim("role", user.Role.Name),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Value.SecretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.Add(_options.Value.Expires),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<ResponseModel<string>> Login(string login, string password)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Login == login);

            if (user == null)
            {
                return new ResponseModel<string>(
                    null,
                    "Користувача не знайдено",
                    HttpStatusCode.NotFound
                );
            }

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

        public async Task<ResponseModel<UserModel>> GetUserByLogin(string login)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Login == login);

            return user != null
                ? new ResponseModel<UserModel>(user, "Користувача знайдено", HttpStatusCode.OK)
                : new ResponseModel<UserModel>(null!, "Користувача не знайдено", HttpStatusCode.NotFound);
        }

        public async Task<ResponseModel<bool>> UpdatePassword(string username, string oldPassword, string newPassword)
        {
            try
            {
                var user = (await GetUserByLogin(username)).Data;
                var passwordHashVerificationResult = new PasswordHasher<UserModel>().VerifyHashedPassword(user, user.PasswordHash, oldPassword);

                if (passwordHashVerificationResult == PasswordVerificationResult.Success)
                {
                    if (user != null)
                    {
                        user.PasswordHash = new PasswordHasher<UserModel>().HashPassword(user, newPassword);

                        _context.Update(user);
                        await _context.SaveChangesAsync();

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

                var userByLogin = await _context.Users.FirstOrDefaultAsync(u => u.Login.Equals(userModel.Login));
                if (userByLogin != null) throw new Exception($"User with the same login already exists!");

                var userByEmail = await _context.Users.FirstOrDefaultAsync(u => u.Login.Equals(userModel.Email));
                if (userByEmail != null) throw new Exception($"User with the same email already exists!");

                var role = (await _context.Roles.ToListAsync()).Find((r) => { return r.Name.Equals(roleName); });
                if (role == null) throw new Exception($"Role with the specified name has not been found!");
                userModel.Role = role;
                userModel.RoleId = userModel.RoleId;

                await _context.Users.AddAsync(userModel);
                await _context.SaveChangesAsync();

                var response = new ResponseModel<UserModel>(userModel, $"User has been created successfully!", System.Net.HttpStatusCode.OK);
                return response;
            }
            catch (Exception ex)
            {
                var response = new ResponseModel<UserModel>(null, $"{ex.Message}", System.Net.HttpStatusCode.InternalServerError);
                return await Task.FromResult(response);
            }
        }

        public async Task<ResponseModel<UserModel>> GetUserByUsername(string username)
        {
            return await GetUserByLogin(username);
        }
    }
}