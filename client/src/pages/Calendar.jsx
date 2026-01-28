import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaCalendarAlt, FaHeartbeat, FaNotesMedical } from 'react-icons/fa';

const locales = {
  'en-US': enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const staticEvents = [
  {
    title: 'Annual Health Checkup',
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 10, 0),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 11, 0),
    allDay: false,
    type: 'reminder',
    icon: <FaNotesMedical className="me-1 text-info" />,
  },
  {
    title: 'Take Blood Pressure Medication',
    start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 8, 0),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 8, 15),
    allDay: false,
    type: 'reminder',
    icon: <FaHeartbeat className="me-1 text-danger" />,
  },
];

const animeBackground = {
  background: `linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)`,
  minHeight: '100vh',
  padding: 0,
  position: 'relative',
  overflow: 'hidden',
};

const animeImages = [
  // Add your favorite anime character images here (transparent PNGs or soft backgrounds work best)
  { src: 'https://static.wikia.nocookie.net/naruto/images/9/97/Naruto_Uzumaki_Part_II.png', style: { top: 40, left: 0, width: 180, opacity: 0.13, filter: 'blur(1px)' } },
  { src: 'https://static.wikia.nocookie.net/onepiece/images/2/2c/Luffy_Anime_Infobox.png', style: { bottom: 0, left: 0, width: 160, opacity: 0.12, filter: 'blur(1px)' } },
  { src: 'https://static.wikia.nocookie.net/pokemon/images/6/6b/Pikachu_anime.png', style: { top: 60, right: 0, width: 140, opacity: 0.14, filter: 'blur(1px)' } },
  { src: 'https://static.wikia.nocookie.net/ghibli/images/9/9e/Chihiro.png', style: { bottom: 0, right: 0, width: 150, opacity: 0.13, filter: 'blur(1px)' } },
];

const funFacts = [
  'Did you know? Laughter can boost your immune system and reduce stress! 😄',
  'Fun Fact: In "One Piece", Luffy’s favorite food is meat. What’s yours?',
  'Did you know? Walking just 30 minutes a day can improve your health.',
  'Anime Fact: Pikachu’s name comes from Japanese onomatopoeia for sparkle (pika) and squeak (chu).',
  'Fun Fact: Drinking water first thing in the morning helps kickstart your metabolism.',
  'Anime Fact: In "Naruto", ramen is Naruto Uzumaki’s favorite food!',
  'Did you know? Smiling, even when you’re not happy, can trick your brain into feeling better.',
  'Anime Fact: "Spirited Away" is the highest-grossing anime film of all time in Japan.',
];

function getRandomFact() {
  return funFacts[Math.floor(Math.random() * funFacts.length)];
}

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fact, setFact] = useState(getRandomFact());

  useEffect(() => {
    setFact(getRandomFact());
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/appointments/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          const apptEvents = data.filter(a => a.status !== 'canceled').map(appt => ({
            title: `Appointment: ${appt.doctor?.name || 'Doctor'} (${appt.doctor?.specialization || 'OPD'})`,
            start: new Date(`${appt.date}T${appt.time}`),
            end: new Date(new Date(`${appt.date}T${appt.time}`).getTime() + 30 * 60000), // 30 min slot
            allDay: false,
            type: 'appointment',
          }));
          setEvents([...staticEvents, ...apptEvents]);
        } else {
          setEvents([...staticEvents]);
        }
      } catch {
        setEvents([...staticEvents]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const eventPropGetter = (event) => {
    if (event.type === 'reminder') {
      return { style: { backgroundColor: '#e0f7fa', color: '#00796b', border: 'none' } };
    }
    return { style: { backgroundColor: '#e3fcec', color: '#256029', border: 'none' } };
  };

  return (
    <div style={animeBackground}>
      {/* Anime background images */}
      {animeImages.map((img, i) => (
        <img
          key={i}
          src={img.src}
          alt="anime bg"
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: 0,
            ...img.style,
          }}
        />
      ))}
      <div className="container py-5 animate-fade-in" style={{ position: 'relative', zIndex: 1 }}>
        <h2 className="mb-4 text-center fw-bold text-primary d-flex align-items-center justify-content-center gap-2">
          <FaCalendarAlt className="text-success" /> My Health Calendar
        </h2>
        <div className="alert alert-warning text-center mb-4 rounded-4 shadow-sm" style={{ fontSize: '1.1rem', background: 'rgba(255,255,255,0.85)' }}>
          <span role="img" aria-label="fun fact">✨</span> {fact}
        </div>
        <div className="bg-white rounded-4 shadow-lg p-4 mb-4" style={{ background: 'rgba(255,255,255,0.95)' }}>
          {loading ? (
            <div className="text-center py-5">
              <span className="spinner-border text-primary"></span> Loading calendar...
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              eventPropGetter={eventPropGetter}
              popup
              views={['month', 'week', 'day', 'agenda']}
              tooltipAccessor={event => event.title}
              defaultDate={new Date()}
              messages={{
                month: 'Month', week: 'Week', day: 'Day', agenda: 'Agenda',
                today: 'Today', previous: '<', next: '>',
              }}
            />
          )}
        </div>
        <div className="alert alert-info text-center mt-3 rounded-4" style={{ background: 'rgba(255,255,255,0.85)' }}>
          <strong>Tip:</strong> Click on any event for more details. Health reminders and appointments are shown in different colors.
        </div>
      </div>
    </div>
  );
};

export default CalendarPage; 