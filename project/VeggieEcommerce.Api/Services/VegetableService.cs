using Microsoft.EntityFrameworkCore;
using VeggieEcommerce.Api.Data;
using VeggieEcommerce.Api.DTOs;

namespace VeggieEcommerce.Api.Services
{
    public class VegetableService : IVegetableService
    {
        private readonly ApplicationDbContext _context;

        public VegetableService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<VegetableDto>> GetAllVegetablesAsync()
        {
            return await _context.Vegetables
                .Include(v => v.Category)
                .Select(v => new VegetableDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Description = v.Description,
                    Price = v.Price,
                    ImageUrl = v.ImageUrl,
                    CategoryId = v.CategoryId,
                    CategoryName = v.Category.Name,
                    InStock = v.InStock,
                    StockQuantity = v.StockQuantity,
                    Unit = v.Unit,
                    NutritionInfo = v.NutritionInfo,
                    Origin = v.Origin,
                    IsOrganic = v.IsOrganic,
                    CreatedAt = v.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<VegetableDto?> GetVegetableByIdAsync(int id)
        {
            return await _context.Vegetables
                .Include(v => v.Category)
                .Where(v => v.Id == id)
                .Select(v => new VegetableDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Description = v.Description,
                    Price = v.Price,
                    ImageUrl = v.ImageUrl,
                    CategoryId = v.CategoryId,
                    CategoryName = v.Category.Name,
                    InStock = v.InStock,
                    StockQuantity = v.StockQuantity,
                    Unit = v.Unit,
                    NutritionInfo = v.NutritionInfo,
                    Origin = v.Origin,
                    IsOrganic = v.IsOrganic,
                    CreatedAt = v.CreatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<VegetableDto>> GetVegetablesByCategoryAsync(int categoryId)
        {
            return await _context.Vegetables
                .Include(v => v.Category)
                .Where(v => v.CategoryId == categoryId)
                .Select(v => new VegetableDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Description = v.Description,
                    Price = v.Price,
                    ImageUrl = v.ImageUrl,
                    CategoryId = v.CategoryId,
                    CategoryName = v.Category.Name,
                    InStock = v.InStock,
                    StockQuantity = v.StockQuantity,
                    Unit = v.Unit,
                    NutritionInfo = v.NutritionInfo,
                    Origin = v.Origin,
                    IsOrganic = v.IsOrganic,
                    CreatedAt = v.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<VegetableDto>> SearchVegetablesAsync(string query)
        {
            return await _context.Vegetables
                .Include(v => v.Category)
                .Where(v => v.Name.Contains(query) || v.Description.Contains(query))
                .Select(v => new VegetableDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Description = v.Description,
                    Price = v.Price,
                    ImageUrl = v.ImageUrl,
                    CategoryId = v.CategoryId,
                    CategoryName = v.Category.Name,
                    InStock = v.InStock,
                    StockQuantity = v.StockQuantity,
                    Unit = v.Unit,
                    NutritionInfo = v.NutritionInfo,
                    Origin = v.Origin,
                    IsOrganic = v.IsOrganic,
                    CreatedAt = v.CreatedAt
                })
                .ToListAsync();
        }
    }
}