using GigaScramSoft.DTO;
using GigaScramSoft.Model;
using Microsoft.EntityFrameworkCore;

namespace GigaScramSoft.Services
{
    public class ContentService : IContentUnitService
    {
        private readonly AppDbContext _context;

        public ContentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ResponseModel<ContentUnitModel>> CreateContentUnit(ContentUnitDTO contentUnitDTO)
        {
            try
            {
                var _subCategory = (await GetSubCategoryByName(contentUnitDTO.SubCategoryName)).Data;

                if (_subCategory == null)
                {
                    return new ResponseModel<ContentUnitModel>(null, "SubCategory by name was not found", System.Net.HttpStatusCode.NotFound);
                }

                var contentUnitModel = new ContentUnitModel();
                contentUnitModel.Header = contentUnitDTO.Header;
                contentUnitModel.ShortDescription = contentUnitDTO.ShortDescription;
                contentUnitModel.FullDescription = contentUnitDTO.FullDescription;
                contentUnitModel.PreviewImage = contentUnitDTO.PreviewImage;
                contentUnitModel.DownloadLink = contentUnitDTO.DownloadLink;
                contentUnitModel.SubCategory = _subCategory;
                contentUnitModel.CreationDate = DateTime.Now;

                await _context.ContentUnits.AddAsync(contentUnitModel);
                await _context.SaveChangesAsync();

                foreach (var img in contentUnitDTO.Images)
                {
                    var contentUnitImage = new ContentUnitImageModel();
                    contentUnitImage.ContentUnitId = contentUnitModel.Id;
                    contentUnitImage.Value = img;
                    await _context.ContentUnitImages.AddAsync(contentUnitImage);
                }

                await _context.SaveChangesAsync();

                contentUnitModel.Images.ForEach(img => img.ContentUnit = null);

                var result = new ResponseModel<ContentUnitModel>(contentUnitModel, "OK", System.Net.HttpStatusCode.OK);
                result.Error = false;

                return result;
            }
            catch (Exception ex)
            {
                return new ResponseModel<ContentUnitModel>(null, ex.Message, System.Net.HttpStatusCode.InternalServerError);
            }
        }

        public async Task<ResponseModel<ContentUnitModel>> UpdateContentUnit(int contentId, ContentUnitDTO contentUnitDTO)
        {
            try
            {
                var foundContentUnit = await _context.ContentUnits
                                                     .Include(c => c.Images)
                                                     .SingleOrDefaultAsync(x => x.Id == contentId);

                if (foundContentUnit == null)
                {
                    return new ResponseModel<ContentUnitModel>(null, "Content unit not found", System.Net.HttpStatusCode.NotFound);
                }

                var _subCategory = (await GetSubCategoryByName(contentUnitDTO.SubCategoryName)).Data;

                if (_subCategory == null)
                {
                    return new ResponseModel<ContentUnitModel>(null, "SubCategory by name was not found", System.Net.HttpStatusCode.NotFound);
                }

                foundContentUnit.Header = contentUnitDTO.Header;
                foundContentUnit.ShortDescription = contentUnitDTO.ShortDescription;
                foundContentUnit.FullDescription = contentUnitDTO.FullDescription;
                foundContentUnit.PreviewImage = contentUnitDTO.PreviewImage;
                foundContentUnit.DownloadLink = contentUnitDTO.DownloadLink;
                foundContentUnit.SubCategoryId = _subCategory.Id;

                await UpdateContentUnitImages(foundContentUnit, contentUnitDTO.Images);

                await _context.SaveChangesAsync();

                foundContentUnit.Images.ForEach(img => img.ContentUnit = null);

                return new ResponseModel<ContentUnitModel>(foundContentUnit, "OK", System.Net.HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return new ResponseModel<ContentUnitModel>(null, ex.Message, System.Net.HttpStatusCode.InternalServerError);
            }
        }

        public async Task<ResponseModel<bool>> DeleteContentUnit(int contentId)
        {
            try
            {
                var foundContentUnit = await _context.ContentUnits
                    .Include(c => c.Images)
                    .SingleOrDefaultAsync(x => x.Id == contentId);

                if (foundContentUnit == null)
                {
                    return new ResponseModel<bool>(false, "Content unit not found", System.Net.HttpStatusCode.NotFound);
                }

                if (foundContentUnit.Images.Any())
                {
                    _context.ContentUnitImages.RemoveRange(foundContentUnit.Images);
                }

                _context.ContentUnits.Remove(foundContentUnit);
                await _context.SaveChangesAsync();

                return new ResponseModel<bool>(true, "Object has been successfully removed!", System.Net.HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return new ResponseModel<bool>(false, ex.Message, System.Net.HttpStatusCode.InternalServerError);
            }
        }

        public async Task<ResponseModel<List<ContentUnitSubCategoryModel>>> GetAllCategories()
        {
            try
            {
                var categories = await _context.ContentUnitSubCategories.Include(sc => sc.MainCategory).ToListAsync();
                return new ResponseModel<List<ContentUnitSubCategoryModel>>(categories, "OK", System.Net.HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return new ResponseModel<List<ContentUnitSubCategoryModel>>(null, ex.Message, System.Net.HttpStatusCode.InternalServerError);
            }
        }

        public async Task<ResponseModel<List<ContentUnitModel>>> GetAllContentUnits()
        {
            try
            {
                var contentUnits = await _context.ContentUnits.ToListAsync();
                return new ResponseModel<List<ContentUnitModel>>(contentUnits, "OK", System.Net.HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return new ResponseModel<List<ContentUnitModel>>(null, ex.Message, System.Net.HttpStatusCode.InternalServerError);
            }
        }

        public async Task<ResponseModel<List<ContentUnitModel>>> GetContentUnitsBySubCategoryId(int subCategoryId)
        {
            try
            {
                var foundContentUnits = await _context.ContentUnits.Where(x => x.SubCategoryId == subCategoryId).ToListAsync<ContentUnitModel>();
                return new ResponseModel<List<ContentUnitModel>>(foundContentUnits, "OK", System.Net.HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return new ResponseModel<List<ContentUnitModel>>(null, ex.Message, System.Net.HttpStatusCode.InternalServerError);
            }
        }

        public async Task<ResponseModel<List<ContentUnitModel>>> GetContentUnitsBySubCategoryName(string subCategoryName)
        {
            try
            {
                var foundContentUnits = await _context.ContentUnits.Where(x => x.SubCategory.Name == subCategoryName).ToListAsync<ContentUnitModel>();
                return new ResponseModel<List<ContentUnitModel>>(foundContentUnits, "OK", System.Net.HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return new ResponseModel<List<ContentUnitModel>>(null, ex.Message, System.Net.HttpStatusCode.InternalServerError);
            }
        }

        public async Task<ResponseModel<List<ContentUnitSubCategoryModel>>> GetSubCategoriesByMainCategoryId(int mainCategoryId)
        {
            try
            {
                var foundSubCategories = await _context.ContentUnitSubCategories.Where(x => x.MainCategoryId == mainCategoryId).ToListAsync<ContentUnitSubCategoryModel>();
                return new ResponseModel<List<ContentUnitSubCategoryModel>>(foundSubCategories, "OK", System.Net.HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return new ResponseModel<List<ContentUnitSubCategoryModel>>(null, ex.Message, System.Net.HttpStatusCode.InternalServerError);
            }
        }

        public async Task<ResponseModel<ContentUnitSubCategoryModel>> GetSubCategoryByName(string name)
        {
            try
            {
                var foundSubCategory = await _context.ContentUnitSubCategories
                                                     .Include(x => x.MainCategory)
                                                     .SingleOrDefaultAsync(x => x.Name == name);

                if (foundSubCategory == null)
                {
                    return new ResponseModel<ContentUnitSubCategoryModel>(null, "SubCategory by name not found", System.Net.HttpStatusCode.NotFound);
                }
                else
                {
                    return new ResponseModel<ContentUnitSubCategoryModel>(foundSubCategory, "SubCategory successfully has found", System.Net.HttpStatusCode.NotFound);
                }
            }
            catch (Exception ex)
            {
                return new ResponseModel<ContentUnitSubCategoryModel>(null, "OK", System.Net.HttpStatusCode.InternalServerError);
            }
        }

        private async Task UpdateContentUnitImages(ContentUnitModel foundContentUnit, List<string> updatedImages)
        {
            var imagesToRemove = _context.ContentUnitImages
                                         .Where(x => x.ContentUnitId == foundContentUnit.Id)
                                         .ToList();

            _context.ContentUnitImages
                    .RemoveRange(imagesToRemove);

            foundContentUnit.Images
                            .Clear();

            foreach (var img in updatedImages)
            {
                ContentUnitImageModel imageModel = new ContentUnitImageModel();
                imageModel.Value = img;
                imageModel.ContentUnitId = foundContentUnit.Id;

                foundContentUnit.Images.Add(imageModel);

                await _context.ContentUnitImages
                              .AddAsync(imageModel);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<ResponseModel<ContentUnitModel>> GetContentUnitById(int contentId)
        {
            try
            {
                var contentUnit = (await _context.ContentUnits.ToListAsync()).First(x => x.Id.Equals(contentId));

                if (contentUnit == null)
                {
                    return new ResponseModel<ContentUnitModel>(null, "The object with such ID has not found!", System.Net.HttpStatusCode.NotFound) { Error = true };
                }

                contentUnit.Images.ForEach(img => img.ContentUnit = null);

                return new ResponseModel<ContentUnitModel>(contentUnit, "OK", System.Net.HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return new ResponseModel<ContentUnitModel>(null, ex.Message, System.Net.HttpStatusCode.InternalServerError) { Error = true };
            }
        }

        public async Task<ResponseModel<ContentPageDTO>> GetContentPageDTO(int numberOfPage, 
                                                                           int unitsPerPage,
                                                                           int subCategoryId,
                                                                           string searchPattern = "")
        {
            try
            {
                var subCategory = await _context.ContentUnitSubCategories
                                                .Include(sc => sc.MainCategory)
                                                .FirstOrDefaultAsync(sc => sc.Id == subCategoryId);

                if (subCategory == null) throw new Exception("There is no category with such id.");

                var contentUnits = await _context.ContentUnits
                                                 .Include(cu => cu.SubCategory)
                                                 .Where(cu => cu.SubCategoryId == subCategoryId)
                                                 .OrderBy(cu => cu.Id)
                                                 .ToListAsync();
                
                if (!searchPattern.Equals(""))
                {
                    contentUnits = contentUnits.Where(cu => cu.Header.Contains(searchPattern, StringComparison.CurrentCultureIgnoreCase))
                                                                     .ToList();
                }

                var contentPageDTO = new ContentPageDTO();
                if (contentUnits.Count == 0) throw new Exception("There are no content units with such parameters.");

                if (contentUnits.Count > unitsPerPage)
                {
                    contentPageDTO.TotalNumberOfPages = contentUnits.Count / unitsPerPage + (contentUnits.Count % unitsPerPage > 0 ? 1 : 0);
                }
                else
                {
                    contentPageDTO.TotalNumberOfPages = 1;
                }

                if (numberOfPage > contentPageDTO.TotalNumberOfPages || numberOfPage <= 0)
                {
                    throw new Exception("The number of page is higher than total number of pages.");
                }
                else
                {
                    var filteredContentUnits = contentUnits.Skip((numberOfPage - 1) * unitsPerPage).Take(unitsPerPage).ToList();
                    var filteredContentUnitsDTO = new List<ContentUnitDTO>();
                    filteredContentUnits.ForEach(cu => filteredContentUnitsDTO.Add(new ContentUnitDTO(cu)));
                    
                    contentPageDTO.ContentUnits = filteredContentUnitsDTO;
                    contentPageDTO.IsTheLastPage = numberOfPage == contentPageDTO.TotalNumberOfPages;
                    contentPageDTO.SubCategory = subCategory;
                    contentPageDTO.PageNumber = numberOfPage;

                    var result = new ResponseModel<ContentPageDTO>
                    {
                        Data = contentPageDTO,
                        Error = false,
                        Message = "Page has been created successfully",
                        StatusCode = System.Net.HttpStatusCode.OK
                    };

                    return result;
                }
            }
            catch (Exception ex)
            {
                return new ResponseModel<ContentPageDTO>(null, ex.Message, System.Net.HttpStatusCode.InternalServerError) { Error = true };
            }
        }
    }
}