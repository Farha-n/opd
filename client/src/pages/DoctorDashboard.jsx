import React, { useEffect, useState } from 'react';
import { FaUserMd, FaCalendarAlt, FaInfoCircle, FaStethoscope, FaCheck, FaTimes, FaStickyNote } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [infoModal, setInfoModal] = useState(null); // appointment object or null
  const [noteModal, setNoteModal] = useState(null); // appointment object or null
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/doctor-dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDoctor(data.doctor || {});
        setAppointments(data.appointments || []);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const openInfoModal = (appt) => setInfoModal(appt);
  const closeInfoModal = () => setInfoModal(null);
  const openNoteModal = (appt) => {
    setNote(appt.note || '');
    setNoteModal(appt);
  };
  const closeNoteModal = () => setNoteModal(null);
  const saveNote = async () => {
    setSavingNote(true);
    // Here you would send a PATCH/POST to backend to save the note for the appointment
    setTimeout(() => {
      setAppointments(appts => appts.map(a => a._id === noteModal._id ? { ...a, note } : a));
      setSavingNote(false);
      setNoteModal(null);
      toast.success('Note saved!');
    }, 1000);
  };

  const getStatusBadge = (status) => {
    if (status === 'confirmed') return <span className="badge bg-success">Confirmed</span>;
    if (status === 'pending') return <span className="badge bg-warning text-dark">Pending</span>;
    if (status === 'canceled') return <span className="badge bg-danger">Canceled</span>;
    return <span className="badge bg-secondary">Unknown</span>;
  };

  if (loading) return <div className="text-center py-5"><span className="spinner-border text-success"></span> Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 py-5 animate-fade-in" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="container">
        <h2 className="fw-bold mb-4 text-success">Doctor Dashboard</h2>
        <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
          <div className="d-flex align-items-center mb-2">
            <FaUserMd className="me-2 text-success" />
            <span className="fw-bold">{doctor.name || 'Doctor'}</span>
          </div>
          <div className="mb-1"><strong>Email:</strong> {doctor.email}</div>
          <div className="mb-1"><strong>Specialization:</strong> {doctor.specialization}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
          <div className="d-flex align-items-center mb-3">
            <FaCalendarAlt className="me-2 text-primary" />
            <span className="fw-bold">Appointments</span>
          </div>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-muted">No appointments found.</td></tr>
                ) : appointments.map(appt => (
                  <tr key={appt._id}>
                    <td>{appt.user?.name || 'N/A'}</td>
                    <td>{appt.date}</td>
                    <td>{appt.time}</td>
                    <td>{getStatusBadge(appt.status || 'confirmed')}</td>
                    <td className="d-flex gap-2">
                      <button className="btn btn-outline-info btn-sm" onClick={() => openInfoModal(appt)}><FaInfoCircle className="me-1" />Medical Info</button>
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => openNoteModal(appt)}><FaStickyNote className="me-1" />Notes</button>
                      {appt.user?._id && (
                        <Link to={`/chat/${appt.user._id}`} className="btn btn-outline-primary btn-sm">Chat</Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Medical Info Modal */}
        {infoModal && (
          <div className="modal fade show d-block" tabIndex="-1" style={{background:'rgba(0,0,0,0.3)'}}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title"><FaStethoscope className="me-2 text-success" />Medical Info: {infoModal.user?.name || 'N/A'}</h5>
                  <button type="button" className="btn-close" onClick={closeInfoModal}></button>
                </div>
                <div className="modal-body">
                  {infoModal.medicalInfo ? (
                    <>
                      <div className="mb-2"><strong>Full Name:</strong> {infoModal.medicalInfo.fullName}</div>
                      <div className="mb-2"><strong>Age:</strong> {infoModal.medicalInfo.age}</div>
                      <div className="mb-2"><strong>Gender:</strong> {infoModal.medicalInfo.gender}</div>
                      <div className="mb-2"><strong>Chronic Conditions:</strong> {infoModal.medicalInfo.chronicConditions}</div>
                      <div className="mb-2"><strong>Medications:</strong> {infoModal.medicalInfo.medications}</div>
                      <div className="mb-2"><strong>Allergies:</strong> {infoModal.medicalInfo.allergies}</div>
                      <div className="mb-2"><strong>Notes:</strong> {infoModal.medicalInfo.notes}</div>
                    </>
                  ) : <div className="text-muted">No medical info available.</div>}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeInfoModal}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Notes Modal */}
        {noteModal && (
          <div className="modal fade show d-block" tabIndex="-1" style={{background:'rgba(0,0,0,0.3)'}}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title"><FaStickyNote className="me-2 text-secondary" />Notes for {noteModal.user?.name || 'N/A'}</h5>
                  <button type="button" className="btn-close" onClick={closeNoteModal}></button>
                </div>
                <div className="modal-body">
                  <textarea className="form-control" rows={4} value={note} onChange={e => setNote(e.target.value)} placeholder="Add notes for this appointment..." />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeNoteModal}>Close</button>
                  <button type="button" className="btn btn-primary" onClick={saveNote} disabled={savingNote}>
                    {savingNote ? <span className="spinner-border spinner-border-sm me-2"></span> : <FaCheck className="me-1" />}Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard; 