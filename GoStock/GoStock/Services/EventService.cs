using GoStock.Models;
using GoStock.Models.DTOs;
using GoStock.Repositories;
using GoStock.Services;

namespace GoStock.Services
{
    public class EventService : IEventService
    {
        private readonly IEventRepository _eventRepository;
        private readonly IUserService _userService;
        private readonly INotificationService _notificationService;

        public EventService(IEventRepository eventRepository, IUserService userService, INotificationService notificationService)
        {
            _eventRepository = eventRepository;
            _userService = userService;
            _notificationService = notificationService;
        }

        public async Task<IEnumerable<EventDto>> GetAllEventsAsync()
        {
            var events = await _eventRepository.GetAllEventsAsync();
            return events.Select(MapToDto);
        }

        public async Task<EventDto?> GetEventByIdAsync(int id)
        {
            var eventItem = await _eventRepository.GetEventByIdAsync(id);
            return eventItem != null ? MapToDto(eventItem) : null;
        }





        public async Task<IEnumerable<EventDto>> GetEventsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var events = await _eventRepository.GetEventsByDateRangeAsync(startDate, endDate);
            return events.Select(MapToDto);
        }

        public async Task<IEnumerable<EventDto>> GetEventsByPriorityAsync(string priority)
        {
            var events = await _eventRepository.GetEventsByPriorityAsync(priority);
            return events.Select(MapToDto);
        }

        public async Task<EventDto> CreateEventAsync(CreateEventDto createEventDto)
        {
            // String'den TimeSpan'e dönüştür
            if (!TimeSpan.TryParse(createEventDto.AgendaTime, out TimeSpan agendaTime))
            {
                throw new ArgumentException("Geçersiz saat formatı");
            }

            var eventItem = new Event
            {
                Title = createEventDto.Title,
                Description = createEventDto.Description,
                AgendaDate = createEventDto.AgendaDate,
                AgendaTime = agendaTime,
                Priority = createEventDto.Priority,
                Status = createEventDto.Status,
                IsCompleted = createEventDto.IsCompleted
            };

            var createdEvent = await _eventRepository.CreateEventAsync(eventItem);
            return MapToDto(createdEvent);
        }

        public async Task<EventDto> UpdateEventAsync(int id, UpdateEventDto updateEventDto)
        {
            var existingEvent = await _eventRepository.GetEventByIdAsync(id);
            if (existingEvent == null)
                throw new ArgumentException($"Event with ID {id} not found");

            if (updateEventDto.Title != null)
                existingEvent.Title = updateEventDto.Title;
            if (updateEventDto.Description != null)
                existingEvent.Description = updateEventDto.Description;
            if (updateEventDto.AgendaDate.HasValue)
                existingEvent.AgendaDate = updateEventDto.AgendaDate.Value;
            if (updateEventDto.AgendaTime != null)
            {
                if (!TimeSpan.TryParse(updateEventDto.AgendaTime, out TimeSpan agendaTime))
                {
                    throw new ArgumentException("Geçersiz saat formatı");
                }
                existingEvent.AgendaTime = agendaTime;
            }
            if (updateEventDto.Priority != null)
                existingEvent.Priority = updateEventDto.Priority;
            if (updateEventDto.Status != null)
                existingEvent.Status = updateEventDto.Status;
            if (updateEventDto.IsCompleted.HasValue)
                existingEvent.IsCompleted = updateEventDto.IsCompleted.Value;

            var updatedEvent = await _eventRepository.UpdateEventAsync(existingEvent);
            return MapToDto(updatedEvent);
        }

        public async Task<bool> DeleteEventAsync(int id)
        {
            return await _eventRepository.DeleteEventAsync(id);
        }

        public async Task<int> GetTotalEventsCountAsync()
        {
            return await _eventRepository.GetTotalEventsCountAsync();
        }

        public async Task<int> GetEventsCountByPriorityAsync(string priority)
        {
            return await _eventRepository.GetEventsCountByPriorityAsync(priority);
        }

        public async Task<Dictionary<string, int>> GetEventsPriorityDistributionAsync()
        {
            var events = await _eventRepository.GetAllEventsAsync();
            return events.GroupBy(e => e.Priority)
                        .ToDictionary(g => g.Key, g => g.Count());
        }

        public async Task<bool> CompleteEventAsync(int id, int completedByUserId)
        {
            var existingEvent = await _eventRepository.GetEventByIdAsync(id);
            if (existingEvent == null)
                return false;

            // Etkinliği tamamlandı olarak işaretle
            existingEvent.IsCompleted = true;
            existingEvent.Status = "Tamamlandı";
            
            var updatedEvent = await _eventRepository.UpdateEventAsync(existingEvent);
            if (updatedEvent == null)
                return false;

            // Tamamlayan kullanıcıyı al
            var completedByUser = await _userService.GetUserByIdAsync(completedByUserId);
            if (completedByUser == null)
                return false;

            // Yöneticilere bildirim gönder
            try
            {
                var admins = await _userService.GetUsersByRoleAsync("admin");
                var managers = await _userService.GetUsersByRoleAsync("manager");
                var allManagers = admins.Concat(managers).ToList();

                foreach (var manager in allManagers)
                {
                    await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                    {
                        UserId = manager.Id.ToString(),
                        Message = $"{completedByUser.FullName} kullanıcısı '{existingEvent.Title}' etkinliğini tamamladı.",
                        Type = "event_completed",
                        Action = "view",
                        Page = "agenda",
                        PageName = "Etkinlikler",
                        RelatedEntityType = "Event",
                        RelatedEntityId = existingEvent.Id,
                        Priority = "medium"
                    });
                }
            }
            catch (Exception ex)
            {
                // Bildirim gönderme hatası olsa bile etkinlik tamamlanmış sayılır
                // Log hatası ama işlemi durdurma
                Console.WriteLine($"Bildirim gönderme hatası: {ex.Message}");
            }

            return true;
        }

        private static EventDto MapToDto(Event eventItem)
        {
            return new EventDto
            {
                Id = eventItem.Id,
                Title = eventItem.Title,
                Description = eventItem.Description,
                AgendaDate = eventItem.AgendaDate,
                AgendaTime = eventItem.AgendaTime,
                Priority = eventItem.Priority,
                CreatedAt = eventItem.CreatedAt,
                Status = eventItem.Status,
                IsCompleted = eventItem.IsCompleted
            };
        }
    }
}
