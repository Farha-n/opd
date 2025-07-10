import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaNotesMedical, FaUser, FaHeartbeat, FaSyringe, FaPills, FaUserShield, FaPhoneAlt } from 'react-icons/fa';

const MedicalInfo = () => {
  const [form, setForm] = useState({
    fullName: '', age: '', gender: '', bloodGroup: '', chronicConditions: '', medications: '', allergies: '', surgeries: '', familyHistory: '', lifestyle: '', emergencyContact: '', notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/medical-info', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data) setForm({ ...form, ...data });
      } catch {}
      setLoading(false);
    };
    fetchInfo();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/medical-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Medical info saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5"><span className="spinner-border text-primary"></span> Loading...</div>;

  return (
    <div className="container py-5 animate-fade-in" style={{ maxWidth: 700, background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', borderRadius: 24, boxShadow: '0 4px 32px #0001', marginTop: 32 }}>
      <div className="mb-4 text-center">
        <FaNotesMedical className="text-primary mb-2" size={38} />
        <h2 className="fw-bold text-primary">Medical Information</h2>
        <div className="text-muted">Keep your health details up to date for better care</div>
      </div>
      <form className="bg-white rounded-4 shadow-sm p-4" onSubmit={handleSubmit} style={{ border: '1px solid #e5e7eb' }}>
        <div className="row g-4">
          <div className="col-md-6">
            <label className="form-label fw-semibold"><FaUser className="me-2 text-secondary" />Full Name</label>
            <input type="text" className="form-control rounded-3" name="fullName" value={form.fullName} onChange={handleChange} required />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Age</label>
            <input type="number" className="form-control rounded-3" name="age" value={form.age} onChange={handleChange} required />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Gender</label>
            <select className="form-select rounded-3" name="gender" value={form.gender} onChange={handleChange} required>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <hr className="my-4" />
        <div className="row g-4">
          <div className="col-md-4">
            <label className="form-label fw-semibold"><FaHeartbeat className="me-2 text-danger" />Blood Group</label>
            <input type="text" className="form-control rounded-3" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} />
          </div>
          <div className="col-md-8">
            <label className="form-label fw-semibold">Chronic Conditions</label>
            <input type="text" className="form-control rounded-3" name="chronicConditions" value={form.chronicConditions} onChange={handleChange} placeholder="e.g. Diabetes, Hypertension" />
          </div>
        </div>
        <div className="row g-4 mt-1">
          <div className="col-md-6">
            <label className="form-label fw-semibold"><FaPills className="me-2 text-info" />Current Medications</label>
            <input type="text" className="form-control rounded-3" name="medications" value={form.medications} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold"><FaSyringe className="me-2 text-warning" />Allergies</label>
            <input type="text" className="form-control rounded-3" name="allergies" value={form.allergies} onChange={handleChange} />
          </div>
        </div>
        <div className="row g-4 mt-1">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Past Surgeries/Procedures</label>
            <input type="text" className="form-control rounded-3" name="surgeries" value={form.surgeries} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Family Medical History</label>
            <input type="text" className="form-control rounded-3" name="familyHistory" value={form.familyHistory} onChange={handleChange} />
          </div>
        </div>
        <div className="row g-4 mt-1">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Lifestyle</label>
            <input type="text" className="form-control rounded-3" name="lifestyle" value={form.lifestyle} onChange={handleChange} placeholder="e.g. Smoking, Alcohol, Exercise" />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold"><FaPhoneAlt className="me-2 text-success" />Emergency Contact</label>
            <input type="text" className="form-control rounded-3" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} />
          </div>
        </div>
        <div className="mt-4">
          <label className="form-label fw-semibold"><FaUserShield className="me-2 text-secondary" />Additional Notes</label>
          <textarea className="form-control rounded-3" name="notes" value={form.notes} onChange={handleChange} rows={2} />
        </div>
        <div className="text-center mt-5">
          <button type="submit" className="btn btn-primary btn-lg px-5 shadow-sm" disabled={saving} style={{ borderRadius: 18, fontWeight: 600, fontSize: 18 }}>
            {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicalInfo; 