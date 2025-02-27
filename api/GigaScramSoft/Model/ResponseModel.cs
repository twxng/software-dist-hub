using System.Net;

namespace GigaScramSoft.Model
{
    public class ResponseModel<T>
    {
        public HttpStatusCode StatusCode { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
        public bool Error { get; set; }

        public ResponseModel(T? data = default, string? message = null, HttpStatusCode statusCode = HttpStatusCode.OK)
        {
            Data = data;
            Message = message;
            StatusCode = statusCode;
            Error = false;
        }
    }
}