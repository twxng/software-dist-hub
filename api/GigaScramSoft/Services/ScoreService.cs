using Microsoft.EntityFrameworkCore;
using GigaScramSoft.Model;

namespace GigaScramSoft.Services
{
    public class ScoreService : IScoreService
    {
        private readonly AppDbContext _context;

        public ScoreService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ResponseModel<int>> GetTotalScore(int contentId)
        {
            try
            {
                var contentUnit = await _context.ContentUnits.FirstOrDefaultAsync(c => c.Id == contentId);
                var scores = await _context.ContentUnitScores
                                   .Where(sc => sc.ContentUnitId == contentId)
                                   .ToListAsync();

                if (contentUnit == null) throw new Exception("User with such contentId has not found!");

                int totalScore = 0;

                foreach (var score in scores) { totalScore += score.IsPositive ? 1 : -1; }

                return new ResponseModel<int>(totalScore, "Total score has gotten successfully!", System.Net.HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return new ResponseModel<int>(0, ex.Message, System.Net.HttpStatusCode.InternalServerError);
            }
        }

        public async Task<ResponseModel<bool>> SetScore(int userId, int contentId, bool isScorePositive)
        {
            try
            {
                var user = _context.Users.FirstOrDefault(u => u.Id == userId);
                var contentUnit = _context.ContentUnits.FirstOrDefault(c => c.Id == contentId);
                var score = _context.ContentUnitScores.FirstOrDefault(sc => sc.ContentUnitId == contentId && sc.UserId == userId);

                if (user == null) throw new Exception("User with such id has not been found!");
                if (contentUnit == null) throw new Exception("Content unit with such id has not been found!");

                if (score != null)
                {
                    score.IsPositive = isScorePositive;
                    _context.ContentUnitScores.Update(score);
                }
                else
                {
                    var newScore = new ScoreModel
                    {
                        ContentUnitId = contentId,
                        UserId = userId,
                        IsPositive = isScorePositive
                    };

                    _context.ContentUnitScores.Add(newScore);
                }

                await _context.SaveChangesAsync();

                return new ResponseModel<bool>(true, "Score updated successfully", System.Net.HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return new ResponseModel<bool>(false, ex.Message, System.Net.HttpStatusCode.InternalServerError);
            }
        }
    }
}