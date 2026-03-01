import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`${API_URL}/contact/team`);
      setTeamMembers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setLoading(false);
    }
  };

  return (
    <div className="team-page">
      <div className="container">
        <h1>Our Team</h1>
        <p className="team-intro">
          Meet the dedicated professionals behind Triokind Pharmaceuticals
        </p>

        {loading ? (
          <p>Loading team members...</p>
        ) : (
          <div className="team-grid">
            {teamMembers.map(member => (
              <div key={member.id} className="team-card">
                <div className="team-image">
                  {member.image_url ? (
                    <img src={member.image_url} alt={member.name} />
                  ) : (
                    <div className="team-placeholder">👤</div>
                  )}
                </div>
                <h3>{member.name}</h3>
                <p className="team-position">{member.position}</p>
                {member.bio && <p className="team-bio">{member.bio}</p>}
                {member.email && <p className="team-email">📧 {member.email}</p>}
              </div>
            ))}
          </div>
        )}

        <section className="careers-section">
          <h2>Join Our Team</h2>
          <p>
            We're always looking for talented individuals who share our passion for healthcare.
            If you're interested in joining the Triokind family, send your resume to triokindpharmaceuticalspvtltd@gmail.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default Team;