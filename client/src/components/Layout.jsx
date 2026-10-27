import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { ApplicationModal } from './ApplicationModal.jsx';

export const Layout = () => {
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar onOpenNewAppModal={() => setIsAppModalOpen(true)} />
      <div className="main-content">
        <Outlet context={{ openNewAppModal: () => setIsAppModalOpen(true) }} />
      </div>

      <ApplicationModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        onSaved={() => {
          setIsAppModalOpen(false);
          // Trigger global reload by dispatching custom event
          window.dispatchEvent(new CustomEvent('applytrack:applicationSaved'));
        }}
      />
    </div>
  );
};
