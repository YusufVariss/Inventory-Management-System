using GoStock.Models;

namespace GoStock.Repositories
{
    public interface IEventRepository
    {
        Task<IEnumerable<Event>> GetAllEventsAsync();
        Task<Event?> GetEventByIdAsync(int id);
        Task<IEnumerable<Event>> GetEventsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Event>> GetEventsByPriorityAsync(string priority);
        Task<Event> CreateEventAsync(Event eventItem);
        Task<Event> UpdateEventAsync(Event eventItem);
        Task<bool> DeleteEventAsync(int id);
        Task<int> GetTotalEventsCountAsync();
        Task<int> GetEventsCountByPriorityAsync(string priority);
    }
}
