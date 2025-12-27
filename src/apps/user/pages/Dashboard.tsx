import { useAuth } from '@shared/contexts/AuthContext';

export default function Dashboard() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome to MGLTickets</h1>
        <p className="mt-2 text-gray-600">Manage your tickets and discover events</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">My Tickets</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Upcoming Events</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Past Events</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">0</p>
        </div>
      </div>

      {/* Placeholder sections */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
        <p className="text-gray-600">No upcoming events. Browse events to get started!</p>
      </div>
    </div>
  );
}

// /**
//  * Dashboard page
//  */

// import { useEffect, useState } from "react";
// import Navbar from "@/shared/components/navigation/Navbar";
// import { getAllEvents } from "../../api/user/eventsApi";
// import { listBookings } from "../../api/user/bookingsApi";
// import { getUserById } from "../../api/user/usersApi";

// const Dashboard = () => {
//   const [user, setUser] = useState<any>(null);
//   const [events, setEvents] = useState<any[]>([]);
//   const [bookings, setBookings] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [userData, eventsData, bookingsData] = await Promise.all([
//           getUserById(1),   // "me" route can be supported in backend
//           getAllEvents(),
//           listBookings()
//         ]);
//         setUser(userData);
//         setEvents(eventsData);
//         setBookings(bookingsData);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (loading) return <div>Loading dashboard...</div>;

//   return (
//     <div>
//       <Navbar />
//       <main className="p-6">
//         <h1 className="text-3xl font-bold mb-4">Welcome, {user?.name}</h1>

//         <section className="mb-6">
//           <h2 className="text-2xl font-semibold mb-2">Upcoming Events</h2>
//           {events.length === 0 ? (
//             <p>No events found.</p>
//           ) : (
//             <ul>
//               {events.map(event => (
//                 <li key={event.id}>{event.name} - {event.date}</li>
//               ))}
//             </ul>
//           )}
//         </section>

//         <section>
//           <h2 className="text-2xl font-semibold mb-2">Your Bookings</h2>
//           {bookings.length === 0 ? (
//             <p>You have no bookings yet.</p>
//           ) : (
//             <ul>
//               {bookings.map(booking => (
//                 <li key={booking.id}>
//                   Event: {booking.event.name} | Tickets: {booking.tickets.length}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </section>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;
