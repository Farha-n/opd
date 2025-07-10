import React, { useEffect, useState } from 'react';
import { FaStethoscope, FaCalendarAlt, FaTimes, FaCheck, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailsModal, setDetailsModal] = useState(null); // appointment object or null
  const [cancelModal, setCancelModal] = useState(null); // appointment object or null
  const [canceling, setCanceling] = useState({});

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/appointments/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch appointments');
        setAppointments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const openDetailsModal = (appt) => setDetailsModal(appt);
  const closeDetailsModal = () => setDetailsModal(null);
  const openCancelModal = (appt) => setCancelModal(appt);
  const closeCancelModal = () => setCancelModal(null);

  // Add a function to refetch doctors (if on patient side)
  const refetchDoctors = async () => {
    if (window.location.pathname === '/my-appointments') {
      try {
        const res = await fetch('/api/doctors');
        // No need to set state here, just to trigger DoctorList update if needed
      } catch {}
    }
  };

  const cancelAppointment = async (id) => {
    setCanceling((prev) => ({ ...prev, [id]: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/appointments/cancel/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to cancel appointment');
      setAppointments((prev) => prev.filter(a => a._id !== id));
      toast.success('Appointment canceled!');
      await refetchDoctors();
    } catch (err) {
      toast.error('Failed to cancel appointment');
    } finally {
      setCanceling((prev) => ({ ...prev, [id]: false }));
      closeCancelModal();
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'confirmed') return <span className="badge bg-success">Confirmed</span>;
    if (status === 'pending') return <span className="badge bg-warning text-dark">Pending</span>;
    if (status === 'canceled') return <span className="badge bg-danger">Canceled</span>;
    return <span className="badge bg-secondary">Unknown</span>;
  };

  if (loading) return (
    <div className="container py-5 animate-fade-in">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="placeholder-glow">
            <span className="placeholder col-6 mb-2"></span>
            <span className="placeholder col-8 mb-2"></span>
            <span className="placeholder col-4"></span>
          </div>
        </div>
      </div>
    </div>
  );
  if (error) return <div className="alert alert-danger mt-5 text-center animate-shake">{error}</div>;

  return (
    <div className="container py-5 animate-fade-in">
      <h2 className="mb-4 text-center fw-bold text-success" style={{letterSpacing:1}}>My Appointments</h2>
      <div className="row justify-content-center">
        <div className="col-md-8">
          {appointments.filter(a => a.status !== 'canceled').length === 0 ? (
            <div className="alert alert-info text-center animate-pop-in">No appointments found.</div>
          ) : (
            <ul className="list-group">
              {appointments.filter(a => a.status !== 'canceled').map((appt) => (
                <li className="list-group-item mb-3 shadow-lg rounded-4 animate-pop-in d-flex align-items-center justify-content-between" key={appt._id} style={{background:'#f8fafd'}}>
                  <div className="d-flex align-items-center gap-3 flex-wrap" style={{cursor:'pointer'}} onClick={() => openDetailsModal(appt)}>
                    <FaStethoscope className="text-success fs-4" />
                    <span className="fw-bold fs-5">{appt.doctor?.name || 'N/A'}</span>
                    <span className="text-muted">{appt.date} {appt.time}</span>
                    {getStatusBadge(appt.status || 'confirmed')}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Link to={appt.doctor?.user ? `/chat/${appt.doctor.user}` : '#'} className="btn btn-outline-primary btn-sm px-3 fw-bold">
                      Chat
                    </Link>
                    <button className="btn btn-outline-danger btn-sm px-3 fw-bold" disabled={canceling[appt._id]} onClick={() => openCancelModal(appt)}>
                      {canceling[appt._id] ? <span className="spinner-border spinner-border-sm"></span> : <FaTimes />} Cancel
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Appointment Details Modal */}
      {detailsModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{background:'rgba(0,0,0,0.3)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg animate-fade-in">
              <div className="modal-header border-0">
                <h5 className="modal-title d-flex align-items-center"><FaInfoCircle className="me-2 text-primary" />Appointment Details</h5>
                <button type="button" className="btn-close" onClick={closeDetailsModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-2"><strong>Doctor:</strong> {detailsModal.doctor?.name || 'N/A'}</div>
                <div className="mb-2"><strong>Specialization:</strong> {detailsModal.doctor?.specialization || 'N/A'}</div>
                <div className="mb-2"><strong>Date:</strong> {detailsModal.date}</div>
                <div className="mb-2"><strong>Time:</strong> {detailsModal.time}</div>
                <div className="mb-2"><strong>Status:</strong> {getStatusBadge(detailsModal.status || 'confirmed')}</div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-secondary w-100" onClick={closeDetailsModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{background:'rgba(0,0,0,0.3)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg animate-fade-in">
              <div className="modal-header border-0">
                <h5 className="modal-title">Cancel Appointment</h5>
                <button type="button" className="btn-close" onClick={closeCancelModal}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to cancel your appointment with <strong>{cancelModal.doctor?.name || 'N/A'}</strong> on <strong>{cancelModal.date} {cancelModal.time}</strong>?</p>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-secondary w-50" onClick={closeCancelModal}>No</button>
                <button type="button" className="btn btn-danger w-50" onClick={() => cancelAppointment(cancelModal._id)}>
                  <FaCheck className="me-1" />Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments; 