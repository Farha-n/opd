import React, { useEffect, useState } from 'react';
import { FaStethoscope, FaUserMd, FaCalendarPlus, FaSearch, FaCheck, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState({});
  const [success, setSuccess] = useState('');
  const [profileModal, setProfileModal] = useState(null); // doctor object or null
  const [confirmModal, setConfirmModal] = useState(null); // {doctor, slot} or null
  const [search, setSearch] = useState('');

  // Move fetchDoctors outside useEffect so it can be called elsewhere
  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors');
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      setError('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleBook = async (doctorId, date, time) => {
    setBooking({ [`${doctorId}-${date}-${time}`]: true });
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ doctorId, date, time }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');
      setSuccess('Appointment booked!');
      toast.success('Appointment booked!');
      // Refetch doctors to update slot status
      fetchDoctors();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setBooking({});
      setConfirmModal(null);
    }
  };

  const filteredDoctors = doctors.filter(doc =>
    doc.name.toLowerCase().includes(search.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="container py-5 animate-fade-in">
      <div className="row">
        {[1,2,3].map(i => (
          <div className="col-md-4 mb-4" key={i}>
            <div className="card h-100 shadow-sm animate-pop-in p-4">
              <div className="placeholder-glow">
                <span className="placeholder col-6 mb-2"></span>
                <span className="placeholder col-8 mb-2"></span>
                <span className="placeholder col-4"></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  if (error) return <div className="alert alert-danger mt-5 text-center animate-shake">{error}</div>;

  return (
    <div className="container py-5 animate-fade-in">
      <h2 className="mb-4 text-center fw-bold text-primary" style={{letterSpacing:1}}>Doctors</h2>
      <div className="mb-4 d-flex justify-content-center">
        <div className="input-group w-100" style={{maxWidth:400}}>
          <span className="input-group-text"><FaSearch /></span>
          <input type="text" className="form-control" placeholder="Search by name or specialization" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      {success && <div className="alert alert-success text-center animate-pop-in">{success}</div>}
      <div className="row g-4">
        {filteredDoctors.length === 0 ? (
          <div className="col-12 text-center text-muted">No doctors found.</div>
        ) : filteredDoctors.map((doc) => (
          <div className="col-12 col-md-6 col-lg-4 mb-4" key={doc._id}>
            <div className="card h-100 shadow-lg border-0 rounded-4 hover:shadow-xl transition-all duration-200 animate-pop-in">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title text-primary d-flex align-items-center gap-2 mb-1" style={{cursor:'pointer'}} onClick={() => setProfileModal(doc)}>
                  <FaUserMd /> {doc.name}
                </h5>
                <h6 className="card-subtitle mb-2 text-muted">{doc.specialization}</h6>
                <p className="card-text mb-2">{doc.bio}</p>
                <div className="mb-2">
                  <strong>Available Slots:</strong>
                  <ul className="list-unstyled mt-2 mb-0">
                    {doc.availableSlots && doc.availableSlots.length > 0 ? (
                      doc.availableSlots.map((slot, idx) => (
                        <li key={idx} className="mb-2 d-flex align-items-center">
                          <span>{slot.date} - {slot.time} </span>
                          {slot.isBooked ? (
                            <span className="badge bg-secondary ms-2">Booked</span>
                          ) : (
                            <button
                              className="btn btn-sm btn-success ms-2 animate-bounce px-3"
                              disabled={booking[`${doc._id}-${slot.date}-${slot.time}`]}
                              onClick={() => setConfirmModal({ doctor: doc, slot })}
                            >
                              <FaCalendarPlus className="me-1" />
                              {booking[`${doc._id}-${slot.date}-${slot.time}`] ? 'Booking...' : 'Book'}
                            </button>
                          )}
                        </li>
                      ))
                    ) : (
                      <li>No slots available</li>
                    )}
                  </ul>
                </div>
                <div className="mt-auto pt-2">
                  <Link to={`/chat/${doc.user}`} className="btn btn-outline-primary btn-sm w-100 fw-bold">
                    Chat
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Doctor Profile Modal */}
      {profileModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{background:'rgba(0,0,0,0.3)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg animate-fade-in">
              <div className="modal-header border-0">
                <h5 className="modal-title d-flex align-items-center"><FaUserMd className="me-2 text-primary" />{profileModal.name}</h5>
                <button type="button" className="btn-close" onClick={() => setProfileModal(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-2"><strong>Specialization:</strong> {profileModal.specialization}</div>
                <div className="mb-2"><strong>Bio:</strong> {profileModal.bio}</div>
                <div className="mb-2"><strong>Available Slots:</strong></div>
                <ul className="list-unstyled">
                  {profileModal.availableSlots.map((slot, idx) => (
                    <li key={idx} className="mb-2 d-flex align-items-center">
                      <span>{slot.date} - {slot.time} </span>
                      {slot.isBooked ? (
                        <span className="badge bg-secondary ms-2">Booked</span>
                      ) : (
                        <button
                          className="btn btn-sm btn-success ms-2 px-3"
                          onClick={() => setConfirmModal({ doctor: profileModal, slot })}
                        >
                          <FaCalendarPlus className="me-1" />Book
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-secondary w-100" onClick={() => setProfileModal(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Booking Confirmation Modal */}
      {confirmModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{background:'rgba(0,0,0,0.3)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg animate-fade-in">
              <div className="modal-header border-0">
                <h5 className="modal-title">Confirm Booking</h5>
                <button type="button" className="btn-close" onClick={() => setConfirmModal(null)}></button>
              </div>
              <div className="modal-body">
                <p>Book <strong>{confirmModal.doctor.name}</strong> for <strong>{confirmModal.slot.date} {confirmModal.slot.time}</strong>?</p>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-secondary" onClick={() => setConfirmModal(null)}><FaTimes className="me-1" />Cancel</button>
                <button type="button" className="btn btn-success" onClick={() => handleBook(confirmModal.doctor._id, confirmModal.slot.date, confirmModal.slot.time)}>
                  <FaCheck className="me-1" />Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorList; 