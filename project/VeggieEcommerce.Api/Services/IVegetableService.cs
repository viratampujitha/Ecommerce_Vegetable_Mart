using VeggieEcommerce.Api.DTOs;

namespace VeggieEcommerce.Api.Services
{
    public interface IVegetableService
    {
        Task<IEnumerable<VegetableDto>> GetAllVegetablesAsync();
        Task<VegetableDto?> GetVegetableByIdAsync(int id);
        Task<IEnumerable<VegetableDto>> GetVegetablesByCategoryAsync(int categoryId);
        Task<IEnumerable<VegetableDto>> SearchVegetablesAsync(string query);
    }
}