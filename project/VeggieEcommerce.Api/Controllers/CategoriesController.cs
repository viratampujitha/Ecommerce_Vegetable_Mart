using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeggieEcommerce.Api.Data;
using VeggieEcommerce.Api.Models;

namespace VeggieEcommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            var categories = await _context.Categories.ToListAsync();
            return Ok(categories);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();
                
            return Ok(category);
        }
    }
}