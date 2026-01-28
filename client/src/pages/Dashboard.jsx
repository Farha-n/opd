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
  {
    title: 'Daily Health Checklist: Simple Habits for a Longer, Healthier Life',
    img: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80',
    link: 'https://healthcare-opd.blogspot.com/2025/07/daily-health-checklist-simple-habits.html',
    content: 'A science-backed daily checklist to boost immunity, mental clarity, and overall well-being. Includes hydration, balanced meals, movement, screen time tips, gratitude, sleep, and more.'
  },
  {
    title: 'Start Your Day Right: 7 Morning Habits for Better Health',
    img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    link: 'https://healthcare-opd.blogspot.com/2025/07/start-your-day-right-7-morning-habits.html',
    content: 'Discover 7 simple morning habits to boost energy, improve focus, and support long-term wellness. Tips include waking up early, hydration, stretching, gratitude, and more.'
  },
  {
    title: 'Top 10 Foods That Naturally Boost Immunity',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    link: 'https://healthcare-opd.blogspot.com/2025/07/top-10-foods-that-naturally-boost.html',
    content: 'Explore 10 everyday foods that help strengthen your immune system naturally, including citrus fruits, garlic, ginger, turmeric, nuts, yogurt, berries, and more.'
  }
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
  const [blogLikes, setBlogLikes] = useState(Array(mockBlogs.length).fill(0));
  const [likedBlogs, setLikedBlogs] = useState(Array(mockBlogs.length).fill(false));

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

  const handleLikeBlog = (idx) => {
    setLikedBlogs((prev) => {
      const updated = [...prev];
      updated[idx] = !updated[idx];
      return updated;
    });
    setBlogLikes((prev) => {
      const updated = [...prev];
      updated[idx] = likedBlogs[idx] ? prev[idx] - 1 : prev[idx] + 1;
      return updated;
    });
  };

  const handleShareBlog = (blog) => {
    navigator.clipboard.writeText(blog.link);
    toast.success('Blog link copied!');
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
                <div className="ms-auto">
                  <a href="/blogs" className="btn btn-outline-info btn-sm" aria-label="View all blogs">View All Blogs</a>
                </div>
              </div>
              <div className="row g-3">
                {mockBlogs.map((blog, idx) => (
                  <div className="col-12 col-md-6 col-lg-4 d-flex" key={idx}>
                    <div
                      className="card flex-fill h-100 shadow-sm border-0 rounded-4 position-relative blog-card animate-pop-in d-flex flex-column"
                      tabIndex={0}
                      style={{ minHeight: 340, background: '#f9fafb', transition: 'box-shadow 0.2s' }}
                    >
                      {/* Featured badge */}
                      <span className="position-absolute top-0 end-0 m-2 badge bg-info bg-opacity-75 text-white shadow-sm" style={{zIndex:2,fontWeight:600,fontSize:'0.85rem'}}>Featured</span>
                      {/* Blog image */}
                      <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem', background: '#e5e7eb' }}>
                        <img
                          src={blog.img}
                          alt={`Cover for ${blog.title}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x225?text=Health+Blog'; }}
                        />
                      </div>
                      {/* Card body */}
                      <div className="card-body d-flex flex-column p-3 flex-grow-1">
                        <a
                          href={blog.link}
                          className="fw-bold text-dark mb-1 text-decoration-none"
                          style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Read blog: ${blog.title}`}
                          tabIndex={0}
                        >
                          {blog.title}
                        </a>
                        <div
                          className="text-muted mb-2"
                          style={{ fontSize: '0.97rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.6em' }}
                        >
                          {blog.content}
                        </div>
                        <div className="d-flex align-items-end justify-content-between mt-auto pt-2 gap-2">
                          <div className="d-flex align-items-center gap-2">
                            <button
                              type="button"
                              className="btn btn-link p-0 text-danger"
                              aria-label={likedBlogs[idx] ? 'Unlike blog' : 'Like blog'}
                              onClick={e => { e.preventDefault(); handleLikeBlog(idx); }}
                              tabIndex={0}
                              style={{ fontSize: '1.1rem' }}
                            >
                              {likedBlogs[idx] ? <FaHeart /> : <FaRegHeart />} <span className="ms-1" style={{fontSize:'0.95rem'}}>{blogLikes[idx]}</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-link p-0 text-primary"
                              aria-label="Share blog"
                              onClick={e => { e.preventDefault(); handleShareBlog(blog); }}
                              tabIndex={0}
                              style={{ fontSize: '1.1rem' }}
                            >
                              <FaCopy />
                            </button>
                          </div>
                          <a
                            href={blog.link}
                            className="text-primary text-decoration-underline small fw-semibold ms-auto"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Read more: ${blog.title}`}
                            tabIndex={0}
                            style={{ fontSize: '0.98rem' }}
                          >
                            Read More
                          </a>
                        </div>
                      </div>
                    </div>
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