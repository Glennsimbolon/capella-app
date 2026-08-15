import React from 'react';

const getStatusInfo = (status) => {
  const statusMap = {
    'Menunggu': { label: 'Menunggu', className: 'badge-menunggu', icon: '⏳' },
    'Disetujui': { label: 'Disetujui', className: 'badge-disetujui', icon: '✅' },
    'Ditolak': { label: 'Ditolak', className: 'badge-ditolak', icon: '❌' }
  };
  return statusMap[status] || statusMap['Menunggu'];
};

const StatusBadge = ({ status }) => {
  const statusInfo = getStatusInfo(status);

  return (
    <span className={`badge ${statusInfo.className}`}>
      {statusInfo.icon}
      {statusInfo.label}
    </span>
  );
};

export default StatusBadge;