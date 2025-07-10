import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaCalendarAlt, FaStethoscope, FaRobot, FaBookOpen, FaChevronRight, FaChevronLeft, FaEdit, FaCopy, FaHeart, FaRegHeart, FaTimes, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

function getUserFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

const healthTips = [
  'Stay hydrated and drink plenty of water.',
  'Exercise regularly for at least 30 minutes a day.',
  'Eat a balanced diet rich in fruits and vegetables.',
  'Get enough sleep and manage stress.',
  'Schedule regular health checkups.'
];

const mockBlogs = [
  { title: '5 Ways to Boost Immunity', img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80', link: '#', content: 'Boost your immunity with these 5 simple steps...' },
  { title: 'Understanding OPD Visits', img: 'https://images.unsplash.com/photo-1512070679279-c2f999098c01?auto=format&fit=crop&w=400&q=80', link: '#', content: 'Learn what to expect during your OPD visit...' },
  { title: 'Healthy Eating for Families', img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80', link: '#', content: 'Tips for healthy eating for the whole family...' },
];

const Dashboard = () => {
  const user = getUserFromToken();
  const [tipIndex, setTipIndex] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileModal, setProfileModal] = useState(false);
  const [profile, setProfile] = useState({ name: user?.email?.split('@')[0] || '', age: '', gender: '', email: user?.email || '' });
  const [aiModal, setAiModal] = useState(null); // 'text' | 'voice' | 'photo' | null
  const [blogModal, setBlogModal] = useState(null); // blog object or null
  const [likedTips, setLikedTips] = useState([]);
  const [canceling, setCanceling] = useState({});

  useEffect(() => {
    // Fetch upcoming appointments for the user
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/appointments/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setAppointments(data.slice(0, 3)); // Show up to 3
      } catch {}
      setLoading(false);
    };
    fetchAppointments();
  }, []);

  const nextTip = () => setTipIndex((tipIndex + 1) % healthTips.length);
  const prevTip = () => setTipIndex((tipIndex - 1 + healthTips.length) % healthTips.length);
  const copyTip = () => {
    navigator.clipboard.writeText(healthTips[tipIndex]);
    toast.success('Health tip copied!');
  };
  const toggleLikeTip = () => {
    setLikedTips((prev) => prev.includes(tipIndex) ? prev.filter(i => i !== tipIndex) : [...prev, tipIndex]);
  };
  const openProfileModal = () => setProfileModal(true);
  const closeProfileModal = () => setProfileModal(false);
  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const saveProfile = (e) => {
    e.preventDefault();
    closeProfileModal();
    toast.success('Profile updated!');
  };
  const openAiModal = (type) => setAiModal(type);
  const closeAiModal = () => setAiModal(null);
  const openBlogModal = (blog) => setBlogModal(blog);
  const closeBlogModal = () => setBlogModal(null);
  const cancelAppointment = async (id) => {
    setCanceling((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAppointments((prev) => prev.filter(a => a._id !== id));
      setCanceling((prev) => ({ ...prev, [id]: false }));
      toast.success('Appointment canceled!');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 py-5 animate-fade-in">
      <div className="container">
        <div className="row g-4 flex-lg-nowrap">
          {/* Left Column: Profile & AI Bot */}
          <div className="col-12 col-md-4" style={{ position: 'relative' }}>
            <div className="bg-white rounded-4 shadow-lg p-4 mb-4 flex flex-column align-items-center position-sticky top-0" style={{ zIndex: 2 }}>
              <FaUserCircle size={72} className="text-primary mb-2" />
              <button className="btn btn-link position-absolute top-0 end-0 mt-2 me-2 p-0" onClick={openProfileModal} title="Edit Profile"><FaEdit /></button>
              <h4 className="fw-bold mb-1 fs-3 text-center">{profile.name || user?.email || 'User'}</h4>
              <div className="text-muted mb-2">Patient</div>
              <div className="mb-2 small d-flex flex-wrap gap-2 justify-content-center">
                <span className="badge bg-info bg-opacity-25 text-info">Appointments: {appointments.filter(a => a.status !== 'canceled').length}</span>
                {profile.age && <span className="badge bg-secondary bg-opacity-25 text-secondary">Age: {profile.age}</span>}
                {profile.gender && <span className="badge bg-secondary bg-opacity-25 text-secondary">Gender: {profile.gender}</span>}
              </div>
              <div className="small text-muted mb-2">{profile.email}</div>
            </div>
            <div className="bg-white rounded-4 shadow-md p-4 mb-4 animate-fade-in">
              <div className="d-flex align-items-center mb-2">
                <FaRobot className="me-2 text-success" />
                <span className="fw-bold">Symptom Checker</span>
              </div>
              <div className="d-flex gap-2 justify-content-center">
                <button className="btn btn-outline-primary btn-sm" onClick={() => openAiModal('text')}><FaStethoscope className="me-1" />Text</button>
                <button className="btn btn-outline-primary btn-sm" onClick={() => openAiModal('voice')}><FaStethoscope className="me-1" />Voice</button>
                <button className="btn btn-outline-primary btn-sm" onClick={() => openAiModal('photo')}><FaStethoscope className="me-1" />Photo</button>
              </div>
            </div>
            <div className="bg-white rounded-4 shadow-md p-4 mb-4 animate-fade-in">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <button className="btn btn-outline-secondary btn-sm" onClick={prevTip} aria-label="Previous tip"><FaChevronLeft /></button>
                <span className="fw-bold text-primary">Health Tip</span>
                <button className="btn btn-outline-secondary btn-sm" onClick={nextTip} aria-label="Next tip"><FaChevronRight /></button>
              </div>
              <div className="alert alert-info text-center animate-pop-in mb-2 d-flex align-items-center justify-content-between" style={{minHeight:48}}>
                <span>{healthTips[tipIndex]}</span>
                <span>
                  <button className="btn btn-link p-0 me-2" onClick={copyTip} title="Copy"><FaCopy /></button>
                  <button className="btn btn-link p-0" onClick={toggleLikeTip} title="Like">
                    {likedTips.includes(tipIndex) ? <FaHeart className="text-danger" /> : <FaRegHeart />}
                  </button>
                </span>
              </div>
            </div>
          </div>
          {/* Right Column: Appointments, Blogs, Book CTA */}
          <div className="col-12 col-md-8">
            <div className="bg-white rounded-4 shadow-lg p-4 mb-4 animate-fade-in">
              <div className="d-flex align-items-center mb-3">
                <FaCalendarAlt className="me-2 text-primary" />
                <span className="fw-bold fs-5">Upcoming Appointments</span>
              </div>
              {loading ? (
                <div className="text-center py-3">
                  <div className="placeholder-glow">
                    <span className="placeholder col-6 mb-2"></span>
                    <span className="placeholder col-8 mb-2"></span>
                    <span className="placeholder col-4"></span>
                  </div>
                </div>
              ) : appointments.filter(a => a.status !== 'canceled').length === 0 ? (
                <div className="alert alert-info text-center">No upcoming appointments.</div>
              ) : (
                <ul className="list-group">
                  {appointments.filter(a => a.status !== 'canceled').map((appt) => (
                    <li className="list-group-item d-flex align-items-center justify-content-between mb-2 rounded shadow-sm animate-pop-in" key={appt._id} style={{background:'#f8fafd'}}>
                      <div>
                        <FaStethoscope className="me-2 text-success" />
                        <span className="fw-bold">{appt.doctor?.name || 'Doctor'}</span>
                        <span className="ms-2 text-muted">{appt.date} {appt.time}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-success me-2">{appt.doctor?.specialization || 'OPD'}</span>
                        <Link to={appt.doctor?.user ? `/chat/${appt.doctor.user}` : '#'} className="btn btn-outline-primary btn-sm">
                          Chat
                        </Link>
                        <button className="btn btn-outline-danger btn-sm" disabled={canceling[appt._id]} onClick={() => cancelAppointment(appt._id)}>
                          {canceling[appt._id] ? <span className="spinner-border spinner-border-sm"></span> : <FaTimes />} Cancel
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-white rounded-4 shadow-md p-4 mb-4 animate-fade-in">
              <div className="d-flex align-items-center mb-3">
                <FaBookOpen className="me-2 text-warning" />
                <span className="fw-bold fs-5">Health Blog Highlights</span>
              </div>
              <div className="row g-2">
                {mockBlogs.map((blog, idx) => (
                  <div className="col-12 col-lg-4" key={idx}>
                    <button className="card h-100 shadow-sm hover:shadow-lg transition-all duration-200 animate-pop-in text-start p-0 border-0 w-100" onClick={() => openBlogModal(blog)}>
                      <img src={blog.img} alt={blog.title} className="card-img-top rounded-top-4" style={{height:120,objectFit:'cover'}} />
                      <div className="card-body p-2">
                        <div className="fw-bold text-dark" style={{fontSize:'1rem'}}>{blog.title}</div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center mt-4">
              <a href="/doctors" className="btn btn-success btn-lg shadow-sm animate-bounce"><FaStethoscope className="me-2" />Book a Doctor</a>
            </div>
            <div className="text-center mt-3">
              <a href="/medical-info" className="btn btn-outline-primary btn-sm">Update Medical Info</a>
            </div>
          </div>
        </div>
      </div>
      {/* Profile Edit Modal */}
      {profileModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{background:'rgba(0,0,0,0.3)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={saveProfile}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Profile</h5>
                  <button type="button" className="btn-close" onClick={closeProfileModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" name="name" value={profile.name} onChange={handleProfileChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Age</label>
                    <input type="number" className="form-control" name="age" value={profile.age} onChange={handleProfileChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Gender</label>
                    <select className="form-select" name="gender" value={profile.gender} onChange={handleProfileChange}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" name="email" value={profile.email} disabled />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeProfileModal}>Close</button>
                  <button type="submit" className="btn btn-primary"><FaCheck className="me-1" />Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* AI Bot Modal */}
      {aiModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{background:'rgba(0,0,0,0.3)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">AI Symptom Checker ({aiModal})</h5>
                <button type="button" className="btn-close" onClick={closeAiModal}></button>
              </div>
              <div className="modal-body text-center">
                <FaRobot size={48} className="mb-3 text-success" />
                <p>This is a placeholder for the {aiModal} input UI.</p>
                <p className="text-muted">(Integrate OpenAI, Whisper, or Vision API here.)</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeAiModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Blog Preview Modal */}
      {blogModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{background:'rgba(0,0,0,0.3)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{blogModal.title}</h5>
                <button type="button" className="btn-close" onClick={closeBlogModal}></button>
              </div>
              <div className="modal-body">
                <img src={blogModal.img} alt={blogModal.title} className="img-fluid rounded mb-3" />
                <p>{blogModal.content}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeBlogModal}>Close</button>
                <a href={blogModal.link} className="btn btn-primary" target="_blank" rel="noopener noreferrer">Read More</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 