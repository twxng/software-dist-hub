namespace GigaScramSoft.Auth
{
    public class AuthSettings
    {
        public required string SecretKey { get; set; }
        public TimeSpan Expires { get; set; }
    }
}