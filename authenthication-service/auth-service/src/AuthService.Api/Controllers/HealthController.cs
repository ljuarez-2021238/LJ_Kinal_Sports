using System;
using System.Data;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult GetHealth()
    {
        var response = new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffz"),
            service = "Kinal Sports AuthService"
        };//Para crear un nuevo objeto de tipo JSON
        return Ok(response);
    }
}
