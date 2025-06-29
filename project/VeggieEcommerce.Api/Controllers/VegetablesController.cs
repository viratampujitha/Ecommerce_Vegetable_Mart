using Microsoft.AspNetCore.Mvc;
using VeggieEcommerce.Api.DTOs;
using VeggieEcommerce.Api.Services;

namespace VeggieEcommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VegetablesController : ControllerBase
    {
        private readonly IVegetableService _vegetableService;
        
        public VegetablesController(IVegetableService vegetableService)
        {
            _vegetableService = vegetableService;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VegetableDto>>> GetVegetables()
        {
            var vegetables = await _vegetableService.GetAllVegetablesAsync();
            return Ok(vegetables);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<VegetableDto>> GetVegetable(int id)
        {
            var vegetable = await _vegetableService.GetVegetableByIdAsync(id);
            if (vegetable == null)
                return NotFound();
                
            return Ok(vegetable);
        }
        
        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<VegetableDto>>> GetVegetablesByCategory(int categoryId)
        {
            var vegetables = await _vegetableService.GetVegetablesByCategoryAsync(categoryId);
            return Ok(vegetables);
        }
        
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<VegetableDto>>> SearchVegetables([FromQuery] string query)
        {
            var vegetables = await _vegetableService.SearchVegetablesAsync(query);
            return Ok(vegetables);
        }
    }
}