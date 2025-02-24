namespace GigaScramSoft.Auth
{
    public class AuthSettings
    {
        public string SecretKey { get; set; }
        public TimeSpan Expires { get; set; }
    }
}