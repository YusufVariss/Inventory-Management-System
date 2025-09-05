using GoStock.Models;
using GoStock.Models.DTOs;

namespace GoStock.Services
{
    public interface IEventService
    {
        Task<IEnumerable<EventDto>> GetAllEventsAsync();
        Task<EventDto?> GetEventByIdAsync(int id);
        Task<IEnumerable<EventDto>> GetEventsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<EventDto>> GetEventsByPriorityAsync(string priority);
        Task<EventDto> CreateEventAsync(CreateEventDto createEventDto);
        Task<EventDto> UpdateEventAsync(int id, UpdateEventDto updateEventDto);
        Task<bool> DeleteEventAsync(int id);
        Task<int> GetTotalEventsCountAsync();
        Task<int> GetEventsCountByPriorityAsync(string priority);
        Task<Dictionary<string, int>> GetEventsPriorityDistributionAsync();
        Task<bool> CompleteEventAsync(int id, int completedByUserId);
    }
}
