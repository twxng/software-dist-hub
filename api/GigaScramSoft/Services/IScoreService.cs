using GigaScramSoft.Model;

namespace GigaScramSoft.Services
{
    public interface IScoreService
    {
        Task<ResponseModel<bool>> SetScore(int userId, int contentId, bool isScorePositive);
        Task<ResponseModel<int>> GetTotalScore(int contentId);
    }
}