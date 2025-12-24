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
