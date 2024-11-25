using FlightSearchApp.Services;
using FlightSearchApp.Models;
using Microsoft.AspNetCore.Mvc;

namespace FlightSearchApp.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class FlightSearchController(AmadeusFlightSearch amadeusFlightSearch) : ControllerBase
    {
        [HttpGet("search")]
        public async Task<IActionResult> SearchFlights([FromQuery] SearchData searchData)
        {
            Console.WriteLine("FlightSearchController -> SearchFlights");
            var result = await amadeusFlightSearch.SearchFlights(searchData);

            // Check if the result has a "Status" property
            var statusProperty = result.GetType().GetProperty("Status");
            if (statusProperty != null)
            {
                var statusValue = statusProperty.GetValue(result)?.ToString();
                if (statusValue == "500") return StatusCode(500, result);
                else return BadRequest(result);
            }
            return Ok(result);
        }

    }
}
