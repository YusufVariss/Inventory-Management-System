using Microsoft.AspNetCore.Mvc;
using GoStock.Services;
using GoStock.Models.DTOs;

namespace GoStock.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly ILogger<EventsController> _logger;

        public EventsController(IEventService eventService, ILogger<EventsController> logger)
        {
            _eventService = eventService;
            _logger = logger;
        }

        // GET: api/Events
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetEvents()
        {
            try
            {
                var events = await _eventService.GetAllEventsAsync();
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Etkinlikler getirilirken hata oluştu");
                return StatusCode(500, "Etkinlikler getirilemedi");
            }
        }

        // GET: api/Events/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EventDto>> GetEvent(int id)
        {
            try
            {
                var eventItem = await _eventService.GetEventByIdAsync(id);
                if (eventItem == null)
                    return NotFound($"ID: {id} olan etkinlik bulunamadı");

                return Ok(eventItem);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Etkinlik ID: {EventId} getirilirken hata oluştu", id);
                return StatusCode(500, "Etkinlik getirilemedi");
            }
        }

        // GET: api/Events/priority/high
        [HttpGet("priority/{priority}")]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetEventsByPriority(string priority)
        {
            try
            {
                var events = await _eventService.GetEventsByPriorityAsync(priority);
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Öncelik etkinlikleri getirilirken hata: {Priority}", priority);
                return StatusCode(500, "Öncelik etkinlikleri getirilemedi");
            }
        }





        // GET: api/Events/date-range?startDate=2024-01-01&endDate=2024-12-31
        [HttpGet("date-range")]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetEventsByDateRange(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var events = await _eventService.GetEventsByDateRangeAsync(startDate, endDate);
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tarih aralığı etkinlikleri getirilirken hata: {StartDate} - {EndDate}", startDate, endDate);
                return StatusCode(500, "Tarih aralığı etkinlikleri getirilemedi");
            }
        }

        // GET: api/Events/count
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetEventsCount()
        {
            try
            {
                var count = await _eventService.GetTotalEventsCountAsync();
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Etkinlik sayısı getirilirken hata oluştu");
                return StatusCode(500, "Etkinlik sayısı getirilemedi");
            }
        }

        // GET: api/Events/count/priority/high
        [HttpGet("count/priority/{priority}")]
        public async Task<ActionResult<int>> GetEventsCountByPriority(string priority)
        {
            try
            {
                var count = await _eventService.GetEventsCountByPriorityAsync(priority);
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Öncelik etkinlik sayısı getirilirken hata: {Priority}", priority);
                return StatusCode(500, "Öncelik etkinlik sayısı getirilemedi");
            }
        }

        // GET: api/Events/statistics/priority-distribution
        [HttpGet("statistics/priority-distribution")]
        public async Task<ActionResult<Dictionary<string, int>>> GetPriorityDistribution()
        {
            try
            {
                var distribution = await _eventService.GetEventsPriorityDistributionAsync();
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Etkinlik öncelik dağılımı getirilirken hata oluştu");
                return StatusCode(500, "Etkinlik öncelik dağılımı getirilemedi");
            }
        }





        // POST: api/Events
        [HttpPost]
        public async Task<ActionResult<EventDto>> CreateEvent(CreateEventDto createEventDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);
                
                var createdEvent = await _eventService.CreateEventAsync(createEventDto);
                return CreatedAtAction(nameof(GetEvent), new { id = createdEvent.Id }, createdEvent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Etkinlik oluşturulurken hata oluştu");
                return StatusCode(500, "Etkinlik oluşturulamadı");
            }
        }

        // PUT: api/Events/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEvent(int id, UpdateEventDto updateEventDto)
        {
            try
            {
                if (id != updateEventDto.Id)
                    return BadRequest("ID uyumsuzluğu");

                var updatedEvent = await _eventService.UpdateEventAsync(id, updateEventDto);
                if (updatedEvent == null)
                    return NotFound($"ID: {id} olan etkinlik bulunamadı");

                return Ok(updatedEvent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Etkinlik ID: {EventId} güncellenirken hata oluştu", id);
                return StatusCode(500, "Etkinlik güncellenemedi");
            }
        }

        // PUT: api/Events/5/complete
        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteEvent(int id, [FromBody] CompleteEventRequest request)
        {
            try
            {
                var result = await _eventService.CompleteEventAsync(id, request.CompletedByUserId);
                if (!result)
                    return NotFound($"ID: {id} olan etkinlik bulunamadı");

                return Ok(new { message = "Etkinlik başarıyla tamamlandı" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Etkinlik ID: {EventId} tamamlanırken hata oluştu", id);
                return StatusCode(500, "Etkinlik tamamlanamadı");
            }
        }

        // DELETE: api/Events/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            try
            {
                var result = await _eventService.DeleteEventAsync(id);
                if (!result)
                    return NotFound($"ID: {id} olan etkinlik bulunamadı");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Etkinlik ID: {EventId} silinirken hata oluştu", id);
                return StatusCode(500, "Etkinlik silinemedi");
            }
        }
    }
}
