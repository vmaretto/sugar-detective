// src/components/Leaderboard.js
import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

const Leaderboard = ({ ranking, language = 'it' }) => {
  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={24} color="#FFD700" />;
    if (rank === 2) return <Medal size={24} color="#C0C0C0" />;
    if (rank === 3) return <Medal size={24} color="#CD7F32" />;
    return <Award size={20} color="#9ca3af" />;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#9ca3af';
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProfile = (participant) => {
    if (typeof participant.profile === 'string') {
      return JSON.parse(participant.profile);
    }
    return participant.profile || {};
  };

  const getDisplayName = (participant) => {
    // Priority: nickname > "Partecipante #ID"
    const data = participant.participant?.data || participant.data || {};
    
    if (data.nickname && data.nickname.trim()) {
      return data.nickname.trim();
    }
    
    return `${language === 'it' ? 'Partecipante' : 'Participant'} #${participant.id}`;
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <Trophy size={32} color="#667eea" />
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          color: '#667eea',
          margin: 0
        }}>
          {language === 'it' ? 'Classifica Generale' : 'Leaderboard'}
        </h2>
      </div>

      {ranking.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
          {language === 'it' 
            ? 'Nessun partecipante ancora. Sii il primo!'
            : 'No participants yet. Be the first!'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {ranking.map((participant, index) => {
            const profile = getProfile(participant);
            const displayName = getDisplayName(participant);
            
            return (
              <div
                key={participant.id}
                style={{
                  padding: '1.5rem',
                  background: index < 3 
                    ? `linear-gradient(135deg, ${getRankColor(participant.rank)}15 0%, ${getRankColor(participant.rank)}05 100%)`
                    : '#f9fafb',
                  border: index < 3 ? `2px solid ${getRankColor(participant.rank)}` : '2px solid #e5e7eb',
                  borderRadius: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Rank */}
                <div style={{
                  minWidth: '60px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  {getRankIcon(participant.rank)}
                  <span style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: getRankColor(participant.rank)
                  }}>
                    #{participant.rank}
                  </span>
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.25rem'
                  }}>
                    {displayName}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    {profile.age && `${profile.age} ${language === 'it' ? 'anni' : 'years old'}`}
                    {profile.profession && ` • ${profile.profession}`}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    marginTop: '0.25rem'
                  }}>
                    {formatDate(participant.timestamp)}
                  </div>
                </div>

                {/* Scores */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem',
                  minWidth: '200px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#667eea'
                    }}>
                      {participant.totalScore}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      {language === 'it' ? 'Totale' : 'Total'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#10b981'
                    }}>
                      {participant.knowledgeScore}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      {language === 'it' ? 'Conoscenza' : 'Knowledge'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Footer */}
      {ranking.length > 0 && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#f3f4f6',
          borderRadius: '15px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
              {language === 'it' ? 'Partecipanti' : 'Participants'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
              {ranking.length}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
              {language === 'it' ? 'Punteggio Medio' : 'Avg Score'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
              {(ranking.reduce((sum, p) => sum + p.totalScore, 0) / ranking.length).toFixed(1)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
              {language === 'it' ? 'Top Score' : 'Top Score'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
              {ranking[0].totalScore}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
