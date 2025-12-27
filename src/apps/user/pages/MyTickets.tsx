// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { getTicketInstances } from '@shared/api/user/ticketInstancesApi';
// import type { TicketInstance } from '@shared/types/TicketInstance';

// export default function MyTickets() {
//   const [tickets, setTickets] = useState<TicketInstance[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchTickets = async () => {
//       try {
//         const data = await getTicketInstances();
//         setTickets(data);
//       } catch (err: any) {
//         setError(err.response?.data?.detail || 'Failed to load tickets');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTickets();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-[400px]">
//         <div className="text-lg">Loading your tickets...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//         {error}
//       </div>
//     );
//   }

//   if (tickets.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Tickets Yet</h2>
//         <p className="text-gray-600 mb-6">You haven't purchased any tickets yet.</p>
//         <Link
//           to="/events"
//           className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
//         >
//           Browse Events
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
//         <p className="mt-2 text-gray-600">View and manage your event tickets</p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {tickets.map((ticket) => (
//           <div key={ticket.id} className="bg-white rounded-lg shadow overflow-hidden">
//             <div className="p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 {ticket.event?.title}
//               </h3>
//               <div className="space-y-2 text-sm text-gray-600">
//                 <p>📅 {new Date(ticket.event?.date || '').toLocaleDateString()}</p>
//                 <p>🕐 {ticket.event?.time}</p>
//                 <p>📍 {ticket.event?.venue}</p>
//                 <p className="font-mono text-xs bg-gray-100 p-2 rounded">
//                   Code: {ticket.code}
//                 </p>
//               </div>
//               <div className="mt-4">
//                 <span
//                   className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
//                     ticket.status === 'active'
//                       ? 'bg-green-100 text-green-800'
//                       : ticket.status === 'used'
//                       ? 'bg-gray-100 text-gray-800'
//                       : 'bg-red-100 text-red-800'
//                   }`}
//                 >
//                   {ticket.status.toUpperCase()}
//                 </span>
//               </div>
//             </div>
//             <div className="bg-gray-50 px-6 py-4">
//               <Link
//                 to={`/events/${ticket.event_id}`}
//                 className="text-sm text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 View Event Details →
//               </Link>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }