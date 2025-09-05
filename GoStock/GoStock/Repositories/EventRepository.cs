using Microsoft.EntityFrameworkCore;
using GoStock.Data;
using GoStock.Models;

namespace GoStock.Repositories
{
    public class EventRepository : IEventRepository
    {
        private readonly GoStockDbContext _context;

        public EventRepository(GoStockDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Event>> GetAllEventsAsync()
        {
            return await _context.Events
                .OrderByDescending(e => e.AgendaDate)
                .ToListAsync();
        }

        public async Task<Event?> GetEventByIdAsync(int id)
        {
            return await _context.Events
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<IEnumerable<Event>> GetEventsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Events
                .Where(e => e.AgendaDate >= startDate && e.AgendaDate <= endDate)
                .OrderBy(e => e.AgendaDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetEventsByPriorityAsync(string priority)
        {
            return await _context.Events
                .Where(e => e.Priority == priority)
                .OrderByDescending(e => e.AgendaDate)
                .ToListAsync();
        }

        public async Task<Event> CreateEventAsync(Event eventItem)
        {
            eventItem.CreatedAt = DateTime.Now;
            _context.Events.Add(eventItem);
            await _context.SaveChangesAsync();
            return eventItem;
        }

        public async Task<Event> UpdateEventAsync(Event eventItem)
        {
            _context.Events.Update(eventItem);
            await _context.SaveChangesAsync();
            return eventItem;
        }

        public async Task<bool> DeleteEventAsync(int id)
        {
            var eventItem = await _context.Events.FindAsync(id);
            if (eventItem == null)
                return false;

            _context.Events.Remove(eventItem);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetTotalEventsCountAsync()
        {
            return await _context.Events.CountAsync();
        }

        public async Task<int> GetEventsCountByPriorityAsync(string priority)
        {
            return await _context.Events.CountAsync(e => e.Priority == priority);
        }
    }
}
